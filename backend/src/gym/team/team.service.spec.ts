import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { FilterTeamDto } from './dto/filter-team.dto';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

describe('TeamService', () => {
  let service: TeamService;
  let prisma: PrismaService;

  const mockPrismaService = {
    gym: {
      findUnique: jest.fn(),
    },
    sport: {
      findUnique: jest.fn(),
    },
    gymTeam: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        TeamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTeamDto: CreateTeamDto = {
      name: 'Jiu-Jitsu Iniciante',
      description: 'Turma para iniciantes',
      openTime: '18:00',
      closeTime: '22:00',
      gymId: 'gym-123',
      sportId: 'sport-123',
    };

    const userId = 'user-123';

    const mockGym = {
      id: 'gym-123',
      name: 'Academia Test',
    };

    const mockSport = {
      id: 'sport-123',
      name: 'Jiu-Jitsu',
    };

    const mockUserGym = {
      userId,
      gymId: 'gym-123',
      sportId: 'sport-123',
      role: 'MANAGER',
    };

    const mockCreatedTeam = {
      id: 'team-123',
      ...createTeamDto,
      gym: mockGym,
      sport: mockSport,
      schedules: [],
    };

    it('should create a team successfully', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(mockGym);
      mockPrismaService.sport.findUnique.mockResolvedValue(mockSport);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.findFirst.mockResolvedValue(null);
      mockPrismaService.gymTeam.create.mockResolvedValue(mockCreatedTeam);

      const result = await service.create(createTeamDto, userId);

      expect(result).toEqual(mockCreatedTeam);
      expect(mockPrismaService.gym.findUnique).toHaveBeenCalledWith({
        where: { id: createTeamDto.gymId },
      });
      expect(mockPrismaService.sport.findUnique).toHaveBeenCalledWith({
        where: { id: createTeamDto.sportId },
      });
      expect(mockPrismaService.gymTeam.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when gym does not exist', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(null);

      await expect(service.create(createTeamDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.gymTeam.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when sport does not exist', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(mockGym);
      mockPrismaService.sport.findUnique.mockResolvedValue(null);

      await expect(service.create(createTeamDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.gymTeam.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not have permission', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(mockGym);
      mockPrismaService.sport.findUnique.mockResolvedValue(mockSport);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'STUDENT',
      });

      await expect(service.create(createTeamDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException when team name already exists', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(mockGym);
      mockPrismaService.sport.findUnique.mockResolvedValue(mockSport);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.findFirst.mockResolvedValue(mockCreatedTeam);

      await expect(service.create(createTeamDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow ADMIN to create team', async () => {
      mockPrismaService.gym.findUnique.mockResolvedValue(mockGym);
      mockPrismaService.sport.findUnique.mockResolvedValue(mockSport);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'ADMIN',
      });
      mockPrismaService.gymTeam.findFirst.mockResolvedValue(null);
      mockPrismaService.gymTeam.create.mockResolvedValue(mockCreatedTeam);

      const result = await service.create(createTeamDto, userId);

      expect(result).toEqual(mockCreatedTeam);
    });
  });

  describe('findAll', () => {
    const userId = 'user-123';
    const mockUserGyms = [
      { gymId: 'gym-123', sportId: 'sport-123' },
      { gymId: 'gym-456', sportId: 'sport-456' },
    ];

    const mockTeams = [
      {
        id: 'team-1',
        name: 'Team 1',
        gymId: 'gym-123',
        sportId: 'sport-123',
      },
      {
        id: 'team-2',
        name: 'Team 2',
        gymId: 'gym-456',
        sportId: 'sport-456',
      },
    ];

    it('should return all teams user has access to', async () => {
      mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
      mockPrismaService.gymTeam.findMany.mockResolvedValue(mockTeams);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockTeams);
      expect(mockPrismaService.userGym.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: { gymId: true, sportId: true },
      });
      expect(mockPrismaService.gymTeam.findMany).toHaveBeenCalled();
    });

    it('should return empty array when user has no gyms', async () => {
      mockPrismaService.userGym.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
      expect(mockPrismaService.gymTeam.findMany).not.toHaveBeenCalled();
    });

    it('should filter teams by gymId', async () => {
      const filters: FilterTeamDto = { gymId: 'gym-123' };
      mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
      mockPrismaService.gymTeam.findMany.mockResolvedValue([mockTeams[0]]);

      await service.findAll(userId, filters);

      expect(mockPrismaService.gymTeam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            gymId: 'gym-123',
          }),
        }),
      );
    });

    it('should filter teams by name', async () => {
      const filters: FilterTeamDto = { name: 'Team 1' };
      mockPrismaService.userGym.findMany.mockResolvedValue(mockUserGyms);
      mockPrismaService.gymTeam.findMany.mockResolvedValue([mockTeams[0]]);

      await service.findAll(userId, filters);

      expect(mockPrismaService.gymTeam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: {
              contains: 'Team 1',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const userId = 'user-123';
    const teamId = 'team-123';

    const mockTeam = {
      id: teamId,
      name: 'Test Team',
      gymId: 'gym-123',
      sportId: 'sport-123',
      gym: { id: 'gym-123', name: 'Test Gym' },
      sport: { id: 'sport-123', name: 'Jiu-Jitsu' },
      schedules: [],
      classes: [],
    };

    const mockUserGym = {
      userId,
      gymId: 'gym-123',
      sportId: 'sport-123',
      role: 'STUDENT',
    };

    it('should return a team when user has access', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);

      const result = await service.findOne(teamId, userId);

      expect(result).toEqual(mockTeam);
      expect(mockPrismaService.gymTeam.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when team does not exist', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(null);

      await expect(service.findOne(teamId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not have access', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue(null);

      await expect(service.findOne(teamId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByGym', () => {
    const userId = 'user-123';
    const gymId = 'gym-123';

    const mockUserGym = {
      userId,
      gymId,
      sportId: 'sport-123',
      role: 'STUDENT',
    };

    const mockTeams = [
      { id: 'team-1', name: 'Team 1', gymId },
      { id: 'team-2', name: 'Team 2', gymId },
    ];

    it('should return teams for a gym', async () => {
      mockPrismaService.userGym.findFirst.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.findMany.mockResolvedValue(mockTeams);

      const result = await service.findByGym(gymId, userId);

      expect(result).toEqual(mockTeams);
      expect(mockPrismaService.gymTeam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gymId },
        }),
      );
    });

    it('should throw ForbiddenException when user does not have access', async () => {
      mockPrismaService.userGym.findFirst.mockResolvedValue(null);

      await expect(service.findByGym(gymId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const teamId = 'team-123';
    const updateDto: UpdateTeamDto = {
      name: 'Updated Team',
      description: 'Updated description',
    };

    const mockTeam = {
      id: teamId,
      name: 'Original Team',
      gymId: 'gym-123',
      sportId: 'sport-123',
    };

    const mockUserGym = {
      userId,
      gymId: 'gym-123',
      sportId: 'sport-123',
      role: 'MANAGER',
    };

    it('should update team when user has permission', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.findFirst.mockResolvedValue(null);
      mockPrismaService.gymTeam.update.mockResolvedValue({ ...mockTeam, ...updateDto });

      const result = await service.update(teamId, updateDto, userId);

      expect(mockPrismaService.gymTeam.update).toHaveBeenCalledWith({
        where: { id: teamId },
        data: expect.objectContaining({
          name: updateDto.name,
          description: updateDto.description,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when team does not exist', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(null);

      await expect(service.update(teamId, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not have permission', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'PROFESSOR',
      });

      await expect(service.update(teamId, updateDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException when new name already exists', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.findFirst.mockResolvedValue({
        id: 'other-team',
        name: updateDto.name,
      });

      await expect(service.update(teamId, updateDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow ADMIN to update team', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'ADMIN',
      });
      mockPrismaService.gymTeam.findFirst.mockResolvedValue(null);
      mockPrismaService.gymTeam.update.mockResolvedValue({ ...mockTeam, ...updateDto });

      const result = await service.update(teamId, updateDto, userId);

      expect(mockPrismaService.gymTeam.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const userId = 'user-123';
    const teamId = 'team-123';

    const mockTeam = {
      id: teamId,
      name: 'Test Team',
      gymId: 'gym-123',
      sportId: 'sport-123',
      _count: {
        classes: 0,
      },
    };

    const mockUserGym = {
      userId,
      gymId: 'gym-123',
      sportId: 'sport-123',
      role: 'MANAGER',
    };

    it('should delete team when user has permission and no classes exist', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);
      mockPrismaService.gymTeam.delete.mockResolvedValue(mockTeam);

      const result = await service.remove(teamId, userId);

      expect(result).toEqual({ message: 'Team deletado com sucesso' });
      expect(mockPrismaService.gymTeam.delete).toHaveBeenCalledWith({
        where: { id: teamId },
      });
    });

    it('should throw NotFoundException when team does not exist', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(null);

      await expect(service.remove(teamId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not have permission', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'PROFESSOR',
      });

      await expect(service.remove(teamId, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when team has classes', async () => {
      const teamWithClasses = {
        ...mockTeam,
        _count: {
          classes: 5,
        },
      };
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(teamWithClasses);
      mockPrismaService.userGym.findUnique.mockResolvedValue(mockUserGym);

      await expect(service.remove(teamId, userId)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.gymTeam.delete).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete team', async () => {
      mockPrismaService.gymTeam.findUnique.mockResolvedValue(mockTeam);
      mockPrismaService.userGym.findUnique.mockResolvedValue({
        ...mockUserGym,
        role: 'ADMIN',
      });
      mockPrismaService.gymTeam.delete.mockResolvedValue(mockTeam);

      const result = await service.remove(teamId, userId);

      expect(result).toEqual({ message: 'Team deletado com sucesso' });
    });
  });
});
