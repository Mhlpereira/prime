import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { CreateClassDto, ClassVisibility } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { FilterClassDto } from './dto/filter-class.dto';
import { GymRoleGuard } from '../common/guards/gym-role.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  const mockClassService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByTeam: jest.fn(),
    findByGym: jest.fn(),
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
      controllers: [ClassController],
      providers: [
        {
          provide: ClassService,
          useValue: mockClassService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        GymRoleGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a class', async () => {
      const createClassDto: CreateClassDto = {
        date: '2025-12-15',
        startTime: '18:00',
        endTime: '19:30',
        notes: 'Test class',
        visibility: ClassVisibility.TEAM,
        maxStudents: 20,
        teamId: 'team-123',
      };
      const userId = 'user-123';
      const expectedResult = { id: 'class-123', ...createClassDto };

      mockClassService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createClassDto, userId);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createClassDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return all classes for user', async () => {
      const userId = 'user-123';
      const expectedResult = [
        { id: 'class-1', name: 'Class 1' },
        { id: 'class-2', name: 'Class 2' },
      ];

      mockClassService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(userId);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(userId, undefined);
    });

    it('should return filtered classes', async () => {
      const userId = 'user-123';
      const filters: FilterClassDto = { gymId: 'gym-123' };
      const expectedResult = [{ id: 'class-1', name: 'Class 1' }];

      mockClassService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(userId, filters);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(userId, filters);
    });
  });

  describe('findByTeam', () => {
    it('should return classes for a team', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const expectedResult = [{ id: 'class-1', teamId }];

      mockClassService.findByTeam.mockResolvedValue(expectedResult);

      const result = await controller.findByTeam(teamId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.findByTeam).toHaveBeenCalledWith(teamId, userId);
    });
  });

  describe('findByGym', () => {
    it('should return classes for a gym', async () => {
      const gymId = 'gym-123';
      const userId = 'user-123';
      const expectedResult = [{ id: 'class-1' }];

      mockClassService.findByGym.mockResolvedValue(expectedResult);

      const result = await controller.findByGym(gymId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.findByGym).toHaveBeenCalledWith(gymId, userId);
    });
  });

  describe('findOne', () => {
    it('should return a single class', async () => {
      const classId = 'class-123';
      const userId = 'user-123';
      const expectedResult = { id: classId, name: 'Test Class' };

      mockClassService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(classId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(classId, userId);
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const classId = 'class-123';
      const userId = 'user-123';
      const updateClassDto: UpdateClassDto = {
        startTime: '19:00',
        notes: 'Updated notes',
      };
      const expectedResult = { id: classId, ...updateClassDto };

      mockClassService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(classId, updateClassDto, userId);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(classId, updateClassDto, userId);
    });
  });

  describe('remove', () => {
    it('should remove a class', async () => {
      const classId = 'class-123';
      const userId = 'user-123';
      const expectedResult = { message: 'Aula deletada com sucesso' };

      mockClassService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(classId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(classId, userId);
    });
  });
});
