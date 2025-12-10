import { Test, TestingModule } from "@nestjs/testing";
import { ClassService } from "./class.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClassDto, ClassVisibility } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { FilterClassDto } from "./dto/filter-class.dto";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("ClassService", () => {
    let service: ClassService;
    let prisma: PrismaService;

    const mockPrismaService = {
        class: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        gymTeam: {
            findUnique: jest.fn(),
        },
        userGym: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ClassService>(ClassService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        const createClassDto: CreateClassDto = {
            date: "2025-12-15",
            startTime: "18:00",
            endTime: "19:30",
            notes: "Aula de Jiu-Jitsu",
            visibility: ClassVisibility.TEAM,
            maxStudents: 20,
            teamId: "team-123",
        };

        const instructorId = "user-123";

        const mockTeam = {
            id: "team-123",
            gymId: "gym-123",
            sportId: "sport-123",
            gym: { id: "gym-123", name: "Academia Test" },
        };

        const mockUserGym = {
            userId: instructorId,
            gymId: "gym-123",
            sportId: "sport-123",
            role: "PROFESSOR",
        };

        const mockCreatedClass = {
            id: "class-123",
            date: new Date("2025-12-15"),
            startTime: "18:00",
            endTime: "19:30",
            notes: "Aula de Jiu-Jitsu",
            visibility: "TEAM",
            maxStudents: 20,
            teamId: "team-123",
            instructorId,
            instructor: {
                id: instructorId,
                name: "Professor Test",
                email: "professor@test.com",
            },
            team: mockTeam,
            attendances: [],
        };

        it("should create a class successfully", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
            mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
            mockPrismaService.class.create.mockResolvedValue(mockCreatedClass);

            const result = await service.create(createClassDto, instructorId);

            expect(result).toEqual(mockCreatedClass);
            expect(mockPrismaService.gymTeam.findUnique).toHaveBeenCalledWith({
                where: { id: createClassDto.teamId },
                include: { gym: true },
            });
            expect(mockPrismaService.userGym.findUnique).toHaveBeenCalled();
            expect(mockPrismaService.class.create).toHaveBeenCalled();
        });

        it("should throw NotFoundException when team does not exist", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(null);

            await expect(service.create(createClassDto, instructorId)).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.gymTeam.findUnique).toHaveBeenCalled();
            expect(mockPrismaService.class.create).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenException when user does not have permission", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
            mockPrismaService.userGym.findUnique.mockResolvedValue({
                ...mockUserGym,
                role: "STUDENT",
            });

            await expect(service.create(createClassDto, instructorId)).rejects.toThrow(ForbiddenException);
        });

        it("should create class with default TEAM visibility when not specified", async () => {
            const dtoWithoutVisibility = { ...createClassDto, visibility: undefined };
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
            mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
            mockPrismaService.class.create.mockResolvedValue(mockCreatedClass);

            await service.create(dtoWithoutVisibility, instructorId);

            expect(mockPrismaService.class.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        visibility: ClassVisibility.TEAM,
                    }),
                })
            );
        });
    });

    describe("findAll", () => {
        const userId = "user-123";
        const mockUserGyms = [
            { gymId: "gym-123", sportId: "sport-123" },
            { gymId: "gym-456", sportId: "sport-456" },
        ];

        const mockClasses = [
            {
                id: "class-1",
                visibility: "GYM",
                teamId: "team-123",
                instructorId: "instructor-1",
            },
            {
                id: "class-2",
                visibility: "TEAM",
                teamId: "team-123",
                instructorId: userId,
            },
        ];

        it("should return all classes user has access to", async () => {
            mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
            mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

            const result = await service.findAll(userId);

            expect(result).toEqual(mockClasses);
            expect(mockPrismaService.userGym.findMany).toHaveBeenCalledWith({
                where: { userId },
                select: { gymId: true, sportId: true },
            });
            expect(mockPrismaService.class.findMany).toHaveBeenCalled();
        });

        it("should filter classes by gymId", async () => {
            const filters: FilterClassDto = { gymId: "gym-123" };
            mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
            mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

            await service.findAll(userId, filters);

            expect(mockPrismaService.class.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        team: { gymId: "gym-123" },
                    }),
                })
            );
        });

        it("should filter classes by date range", async () => {
            const filters: FilterClassDto = {
                dateFrom: "2025-12-01",
                dateTo: "2025-12-31",
            };
            mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
            mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

            await service.findAll(userId, filters);

            expect(mockPrismaService.class.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        date: {
                            gte: new Date("2025-12-01"),
                            lte: new Date("2025-12-31"),
                        },
                    }),
                })
            );
        });
    });

    describe("findOne", () => {
        const userId = "user-123";
        const classId = "class-123";

        const mockClass = {
            id: classId,
            visibility: "TEAM",
            instructorId: userId,
            team: {
                gymId: "gym-123",
                sportId: "sport-123",
            },
            attendances: [],
        };

        it("should return a class when user is the instructor", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(mockClass);

            const result = await service.findOne(classId, userId);

            expect(result).toEqual(mockClass);
            expect(mockPrismaService.class.findUnique).toHaveBeenCalledWith({
                where: { id: classId },
                include: expect.any(Object),
            });
        });

        it("should throw NotFoundException when class does not exist", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(null);

            await expect(service.findOne(classId, userId)).rejects.toThrow(NotFoundException);
        });

        it("should throw ForbiddenException when user does not have access to private class", async () => {
            const privateClass = {
                ...mockClass,
                visibility: "PRIVATE",
                instructorId: "other-user",
                attendances: [],
            };
            mockPrismaService.class.findUnique.mockResolvedValue(privateClass);
            mockPrismaService.userGym.findUnique.mockResolvedValue(null);

            await expect(service.findOne(classId, userId)).rejects.toThrow(ForbiddenException);
        });

        it("should allow access when user is a participant", async () => {
            const classWithUserAsParticipant = {
                ...mockClass,
                instructorId: "other-user",
                attendances: [{ studentId: userId }],
            };
            mockPrismaService.class.findUnique.mockResolvedValue(classWithUserAsParticipant);

            const result = await service.findOne(classId, userId);

            expect(result).toEqual(classWithUserAsParticipant);
        });
    });

    describe("update", () => {
        const userId = "user-123";
        const classId = "class-123";
        const updateDto: UpdateClassDto = {
            startTime: "19:00",
            notes: "Updated notes",
        };

        const mockClass = {
            id: classId,
            instructorId: userId,
            team: {
                gymId: "gym-123",
                sportId: "sport-123",
            },
        };

        it("should update class when user is the instructor", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
            mockPrismaService.class.update.mockResolvedValue({ ...mockClass, ...updateDto });

            const result = await service.update(classId, updateDto, userId);

            expect(mockPrismaService.class.update).toHaveBeenCalledWith({
                where: { id: classId },
                data: expect.objectContaining({
                    startTime: "19:00",
                    notes: "Updated notes",
                }),
                include: expect.any(Object),
            });
        });

        it("should throw NotFoundException when class does not exist", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(null);

            await expect(service.update(classId, updateDto, userId)).rejects.toThrow(NotFoundException);
        });

        it("should allow ADMIN to update any class", async () => {
            const otherUserClass = { ...mockClass, instructorId: "other-user" };
            mockPrismaService.class.findUnique.mockResolvedValue(otherUserClass);
            mockPrismaService.userGym.findUnique.mockResolvedValue({
                userId,
                gymId: "gym-123",
                sportId: "sport-123",
                role: "ADMIN",
            });
            mockPrismaService.class.update.mockResolvedValue({ ...otherUserClass, ...updateDto });

            await service.update(classId, updateDto, userId);

            expect(mockPrismaService.class.update).toHaveBeenCalled();
        });

        it("should throw ForbiddenException when user is not instructor and not admin", async () => {
            const otherUserClass = { ...mockClass, instructorId: "other-user" };
            mockPrismaService.class.findUnique.mockResolvedValue(otherUserClass);
            mockPrismaService.userGym.findUnique.mockResolvedValue({
                userId,
                gymId: "gym-123",
                sportId: "sport-123",
                role: "STUDENT",
            });

            await expect(service.update(classId, updateDto, userId)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("remove", () => {
        const userId = "user-123";
        const classId = "class-123";

        const mockClass = {
            id: classId,
            instructorId: userId,
            team: {
                gymId: "gym-123",
                sportId: "sport-123",
            },
        };

        it("should delete class when user is the instructor", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(mockClass);
            mockPrismaService.class.delete.mockResolvedValue(mockClass);

            const result = await service.remove(classId, userId);

            expect(result).toEqual({ message: "Aula deletada com sucesso" });
            expect(mockPrismaService.class.delete).toHaveBeenCalledWith({
                where: { id: classId },
            });
        });

        it("should throw NotFoundException when class does not exist", async () => {
            mockPrismaService.class.findUnique.mockResolvedValue(null);

            await expect(service.remove(classId, userId)).rejects.toThrow(NotFoundException);
        });

        it("should allow MANAGER to delete any class", async () => {
            const otherUserClass = { ...mockClass, instructorId: "other-user" };
            mockPrismaService.class.findUnique.mockResolvedValue(otherUserClass);
            mockPrismaService.userGym.findUnique.mockResolvedValue({
                userId,
                gymId: "gym-123",
                sportId: "sport-123",
                role: "MANAGER",
            });
            mockPrismaService.class.delete.mockResolvedValue(otherUserClass);

            await service.remove(classId, userId);

            expect(mockPrismaService.class.delete).toHaveBeenCalled();
        });

        it("should throw ForbiddenException when user cannot delete", async () => {
            const otherUserClass = { ...mockClass, instructorId: "other-user" };
            mockPrismaService.class.findUnique.mockResolvedValue(otherUserClass);
            mockPrismaService.userGym.findUnique.mockResolvedValue({
                userId,
                gymId: "gym-123",
                sportId: "sport-123",
                role: "PROFESSOR",
            });

            await expect(service.remove(classId, userId)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("findByTeam", () => {
        const userId = "user-123";
        const teamId = "team-123";

        const mockTeam = {
            id: teamId,
            gymId: "gym-123",
            sportId: "sport-123",
        };

        const mockUserGym = {
            userId,
            gymId: "gym-123",
            sportId: "sport-123",
            role: "STUDENT",
        };

        const mockClasses = [
            { id: "class-1", visibility: "TEAM" },
            { id: "class-2", visibility: "GYM" },
        ];

        it("should return classes for a team", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
            mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
            mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

            const result = await service.findByTeam(teamId, userId);

            expect(result).toEqual(mockClasses);
            expect(mockPrismaService.class.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        teamId,
                    }),
                })
            );
        });

        it("should throw NotFoundException when team does not exist", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(null);

            await expect(service.findByTeam(teamId, userId)).rejects.toThrow(NotFoundException);
        });

        it("should throw ForbiddenException when user does not have access", async () => {
            mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
            mockPrismaService.userGym.findUnique.mockResolvedValue(null);

            await expect(service.findByTeam(teamId, userId)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("findByGym", () => {
        const userId = "user-123";
        const gymId = "gym-123";

        const mockUserGym = {
            userId,
            gymId,
            sportId: "sport-123",
            role: "STUDENT",
        };

        const mockClasses = [
            { id: "class-1", visibility: "GYM" },
            { id: "class-2", visibility: "GYM" },
        ];

        it("should return classes for a gym", async () => {
            mockPrismaService.userGym.findFirst.mockResolvedValue(mockUserGym);
            mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

            const result = await service.findByGym(gymId, userId);

            expect(result).toEqual(mockClasses);
            expect(mockPrismaService.class.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        team: { gymId },
                    }),
                })
            );
        });

        it("should throw ForbiddenException when user does not have access", async () => {
            mockPrismaService.userGym.findFirst.mockResolvedValue(null);

            await expect(service.findByGym(gymId, userId)).rejects.toThrow(ForbiddenException);
        });
    });
});
