import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    createUser: jest.fn(),
    tokensGenerate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      birthday: new Date('1990-01-01'),
    };

    const mockUser = {
      id: '01JDXXXXX',
      email: createUserDto.email,
      name: createUserDto.name,
      birthday: createUserDto.birthday,
      password: 'hashed_password',
    };

    const mockTokens = {
      accessToken: 'access_token_mock',
      refreshToken: 'refresh_token_mock',
    };

    it('should register a new user and return user with tokens', async () => {
      mockAuthService.createUser.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      const mockReply = {} as any;
      const result = await controller.register(createUserDto, mockReply);

      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        user: {
          email: mockUser.email,
          name: mockUser.name,
        },
        tokens: mockTokens,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockAuthService.createUser.mockRejectedValue(
        new ConflictException('A user with the given unique field already exists.')
      );

      const mockReply = {} as any;
      await expect(controller.register(createUserDto, mockReply)).rejects.toThrow(
        ConflictException
      );
      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Unexpected error');
      mockAuthService.createUser.mockRejectedValue(error);

      const mockReply = {} as any;
      await expect(controller.register(createUserDto, mockReply)).rejects.toThrow(error);
      expect(authService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
