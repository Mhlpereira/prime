import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { CreateClassDto, ClassVisibility } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { FilterClassDto } from "./dto/filter-class.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClassService {
    constructor(private prisma: PrismaService) {}

    async create(createClassDto: CreateClassDto, instructorId: string) {
        const team = await this.prisma.gymTeam.findUnique({
            where: { id: createClassDto.teamId },
            include: { gym: true },
        });

        if (!team) {
            throw new NotFoundException("Team não encontrado");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId: instructorId,
                    gymId: team.gymId,
                    sportId: team.sportId,
                },
            },
        });

        if (!userGym || !["ADMIN", "PROFESSOR", "MANAGER"].includes(userGym.role)) {
            throw new ForbiddenException("Você não tem permissão para criar aulas neste team");
        }

        return this.prisma.class.create({
            data: {
                date: new Date(createClassDto.date),
                startTime: createClassDto.startTime,
                endTime: createClassDto.endTime,
                notes: createClassDto.notes,
                visibility: createClassDto.visibility || ClassVisibility.TEAM,
                maxStudents: createClassDto.maxStudents,
                teamId: createClassDto.teamId,
                instructorId,
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
                    include: {
                        gym: true,
                        sport: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findAll(userId: string, filters?: FilterClassDto) {
        const userGyms = await this.prisma.userGym.findMany({
            where: { userId },
            select: { gymId: true, sportId: true },
        });

        const gymIds = userGyms.map(ug => ug.gymId);

        const where: any = {
            team: {
                gymId: filters?.gymId || { in: gymIds },
            },
        };

        if (filters?.teamId) {
            where.teamId = filters.teamId;
        }

        if (filters?.instructorId) {
            where.instructorId = filters.instructorId;
        }

        if (filters?.visibility) {
            where.visibility = filters.visibility;
        } else {
            where.OR = [
                { visibility: "GYM" },
                { visibility: "TEAM" },
                { instructorId: userId },
                { attendances: { some: { studentId: userId } } },
            ];
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.date.lte = new Date(filters.dateTo);
            }
        }

        return this.prisma.class.findMany({
            where,
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
                    include: {
                        gym: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        sport: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    async findOne(id: string, userId: string) {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
                    include: {
                        gym: true,
                        sport: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!classItem) {
            throw new NotFoundException("Aula não encontrada");
        }

        await this.checkViewPermission(classItem, userId);

        return classItem;
    }

    async update(id: string, updateClassDto: UpdateClassDto, userId: string) {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: { team: true },
        });

        if (!classItem) {
            throw new NotFoundException("Aula não encontrada");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId,
                    gymId: classItem.team.gymId,
                    sportId: classItem.team.sportId,
                },
            },
        });

        if (classItem.instructorId !== userId && (!userGym || !["ADMIN", "MANAGER"].includes(userGym.role))) {
            throw new ForbiddenException("Você não tem permissão para editar esta aula");
        }

        const updateData: any = {};

        if (updateClassDto.date) updateData.date = new Date(updateClassDto.date);
        if (updateClassDto.startTime) updateData.startTime = updateClassDto.startTime;
        if (updateClassDto.endTime !== undefined) updateData.endTime = updateClassDto.endTime;
        if (updateClassDto.notes !== undefined) updateData.notes = updateClassDto.notes;
        if (updateClassDto.visibility) updateData.visibility = updateClassDto.visibility;
        if (updateClassDto.maxStudents !== undefined) updateData.maxStudents = updateClassDto.maxStudents;

        return this.prisma.class.update({
            where: { id },
            data: updateData,
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
                    include: {
                        gym: true,
                        sport: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async remove(id: string, userId: string) {
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: { team: true },
        });

        if (!classItem) {
            throw new NotFoundException("Aula não encontrada");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId,
                    gymId: classItem.team.gymId,
                    sportId: classItem.team.sportId,
                },
            },
        });

        if (classItem.instructorId !== userId && (!userGym || !["ADMIN", "MANAGER"].includes(userGym.role))) {
            throw new ForbiddenException("Você não tem permissão para deletar esta aula");
        }

        await this.prisma.class.delete({
            where: { id },
        });

        return { message: "Aula deletada com sucesso" };
    }

    async findByTeam(teamId: string, userId: string) {
        const team = await this.prisma.gymTeam.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new NotFoundException("Team não encontrado");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId,
                    gymId: team.gymId,
                    sportId: team.sportId,
                },
            },
        });

        if (!userGym) {
            throw new ForbiddenException("Você não tem acesso a este team");
        }

        return this.prisma.class.findMany({
            where: {
                teamId,
                OR: [
                    { visibility: "GYM" },
                    { visibility: "TEAM" },
                    { instructorId: userId },
                    { attendances: { some: { studentId: userId } } },
                ],
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    async findByGym(gymId: string, userId: string) {
        const userGym = await this.prisma.userGym.findFirst({
            where: {
                userId,
                gymId,
            },
        });

        if (!userGym) {
            throw new ForbiddenException("Você não tem acesso a este gym");
        }

        return this.prisma.class.findMany({
            where: {
                team: { gymId },
                OR: [{ visibility: "GYM" }, { instructorId: userId }, { attendances: { some: { studentId: userId } } }],
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
                    include: {
                        sport: true,
                    },
                },
                attendances: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    private async checkViewPermission(classItem: any, userId: string) {
        if (classItem.instructorId === userId) {
            return;
        }

        const isParticipant = classItem.attendances.some((att: any) => att.studentId === userId);
        if (isParticipant) {
            return;
        }

        if (classItem.visibility === "PRIVATE") {
            throw new ForbiddenException("Você não tem permissão para visualizar esta aula privada");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId,
                    gymId: classItem.team.gymId,
                    sportId: classItem.team.sportId,
                },
            },
        });

        if (!userGym) {
            throw new ForbiddenException("Você não tem acesso a esta aula");
        }

        if (classItem.visibility === "TEAM") {
            return;
        }

        if (classItem.visibility === "GYM") {
            return;
        }
    }
}
