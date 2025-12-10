import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from "@nestjs/common";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { FilterTeamDto } from "./dto/filter-team.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) {}

    async create(createTeamDto: CreateTeamDto, userId: string) {
        const gym = await this.prisma.gym.findUnique({
            where: { id: createTeamDto.gymId },
        });

        if (!gym) {
            throw new NotFoundException("Gym não encontrado");
        }

        const sport = await this.prisma.sport.findUnique({
            where: { id: createTeamDto.sportId },
        });

        if (!sport) {
            throw new NotFoundException("Sport não encontrado");
        }

        const userGym = await this.prisma.userGym.findUnique({
            where: {
                userId_gymId_sportId: {
                    userId,
                    gymId: createTeamDto.gymId,
                    sportId: createTeamDto.sportId,
                },
            },
        });

        if (!userGym || !["ADMIN", "MANAGER"].includes(userGym.role)) {
            throw new ForbiddenException("Você não tem permissão para criar teams neste gym");
        }

        const existingTeam = await this.prisma.gymTeam.findFirst({
            where: {
                name: createTeamDto.name,
                gymId: createTeamDto.gymId,
                sportId: createTeamDto.sportId,
            },
        });

        if (existingTeam) {
            throw new ConflictException("Já existe um team com este nome neste gym e sport");
        }

        return this.prisma.gymTeam.create({
            data: {
                name: createTeamDto.name,
                description: createTeamDto.description,
                openTime: createTeamDto.openTime,
                closeTime: createTeamDto.closeTime,
                gymId: createTeamDto.gymId,
                sportId: createTeamDto.sportId,
            },
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
                schedules: true,
            },
        });
    }

    async findAll(userId: string, filters?: FilterTeamDto) {
        const userGyms = await this.prisma.userGym.findMany({
            where: { userId },
            select: { gymId: true, sportId: true },
        });

        if (userGyms.length === 0) {
            return [];
        }

        const where: any = {
            OR: userGyms.map(ug => ({
                gymId: ug.gymId,
                sportId: ug.sportId,
            })),
        };

        if (filters?.gymId) {
            where.gymId = filters.gymId;
        }

        if (filters?.sportId) {
            where.sportId = filters.sportId;
        }

        if (filters?.name) {
            where.name = {
                contains: filters.name,
                mode: "insensitive",
            };
        }

        return this.prisma.gymTeam.findMany({
            where,
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
                schedules: true,
                _count: {
                    select: {
                        classes: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    async findOne(id: string, userId: string) {
        const team = await this.prisma.gymTeam.findUnique({
            where: { id },
            include: {
                gym: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                sport: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                schedules: true,
                classes: {
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                attendances: true,
                            },
                        },
                    },
                    orderBy: {
                        date: "desc",
                    },
                    take: 10,
                },
            },
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

        return team;
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

        return this.prisma.gymTeam.findMany({
            where: { gymId },
            include: {
                sport: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                schedules: true,
                _count: {
                    select: {
                        classes: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    async update(id: string, updateTeamDto: UpdateTeamDto, userId: string) {
        const team = await this.prisma.gymTeam.findUnique({
            where: { id },
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

        if (!userGym || !["ADMIN", "MANAGER"].includes(userGym.role)) {
            throw new ForbiddenException("Você não tem permissão para editar este team");
        }

        if (updateTeamDto.name) {
            const existingTeam = await this.prisma.gymTeam.findFirst({
                where: {
                    name: updateTeamDto.name,
                    gymId: team.gymId,
                    sportId: team.sportId,
                    id: { not: id },
                },
            });

            if (existingTeam) {
                throw new ConflictException("Já existe um team com este nome neste gym e sport");
            }
        }

        const updateData: any = {};
        if (updateTeamDto.name) updateData.name = updateTeamDto.name;
        if (updateTeamDto.description !== undefined) updateData.description = updateTeamDto.description;
        if (updateTeamDto.openTime !== undefined) updateData.openTime = updateTeamDto.openTime;
        if (updateTeamDto.closeTime !== undefined) updateData.closeTime = updateTeamDto.closeTime;

        return this.prisma.gymTeam.update({
            where: { id },
            data: updateData,
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
                schedules: true,
            },
        });
    }

    async remove(id: string, userId: string) {
        const team = await this.prisma.gymTeam.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        classes: true,
                    },
                },
            },
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

        if (!userGym || !["ADMIN", "MANAGER"].includes(userGym.role)) {
            throw new ForbiddenException("Você não tem permissão para deletar este team");
        }

        if (team._count.classes > 0) {
            throw new BadRequestException("Não é possível deletar um team que possui aulas cadastradas");
        }

        await this.prisma.gymTeam.delete({
            where: { id },
        });

        return { message: "Team deletado com sucesso" };
    }
}
