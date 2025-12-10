import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { FilterTeamDto } from './dto/filter-team.dto';
import { GymRoleGuard } from '../../common/guards/gym-role.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('TeamController', () => {
  let controller: TeamController;
  let service: TeamService;

  const mockTeamService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByGym: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    userGym: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    gymTeam: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        GymRoleGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<TeamController>(TeamController);
    service = module.get<TeamService>(TeamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a team', async () => {
      const createTeamDto: CreateTeamDto = {
        name: 'Jiu-Jitsu Iniciante',
        description: 'Turma para iniciantes',
        openTime: '18:00',
        closeTime: '22:00',
        gymId: 'gym-123',
        sportId: 'sport-123',
      };
      const userId = 'user-123';
      const expectedResult = { id: 'team-123', ...createTeamDto };

      mockTeamService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTeamDto, userId);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createTeamDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return all teams for user', async () => {
      const userId = 'user-123';
      const expectedResult = [
        { id: 'team-1', name: 'Team 1' },
        { id: 'team-2', name: 'Team 2' },
      ];

      mockTeamService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(userId, undefined);
    });

    it('should return filtered teams', async () => {
      const userId = 'user-123';
      const filters: FilterTeamDto = { gymId: 'gym-123' };
      const expectedResult = [{ id: 'team-1', name: 'Team 1' }];

      mockTeamService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(userId, filters);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
    });
  });

  describe('findByGym', () => {
    it('should return teams for a gym', async () => {
      const gymId = 'gym-123';
      const userId = 'user-123';
      const expectedResult = [{ id: 'team-1', gymId }];

      mockTeamService.findByGym.mockResolvedValue(expectedResult);

      const result = await controller.findByGym(gymId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.findByGym).toHaveBeenCalledWith(gymId, userId);
    });
  });

  describe('findOne', () => {
    it('should return a single team', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const expectedResult = { id: teamId, name: 'Test Team' };

      mockTeamService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(teamId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(teamId, userId);
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const updateTeamDto: UpdateTeamDto = {
        name: 'Updated Team',
        description: 'Updated description',
      };
      const expectedResult = { id: teamId, ...updateTeamDto };

      mockTeamService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(teamId, updateTeamDto, userId);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(teamId, updateTeamDto, userId);
    });
  });

  describe('remove', () => {
    it('should remove a team', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const expectedResult = { message: 'Team deletado com sucesso' };

      mockTeamService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(teamId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(teamId, userId);
    });
  });
});
