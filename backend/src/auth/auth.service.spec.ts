import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashService } from '../common/hash/hash.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../common/token/token.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let hashService: HashService;
  let tokenService: TokenService;

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockTokenService = {
    generateTokens: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockPrismaService = {
    refreshToken: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: HashService, useValue: mockHashService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
    tokenService = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      birthday: new Date('1990-01-01'),
    };

    const hashedPassword = 'hashed_password';
    const createdUser = {
      id: '01JDXXXXX',
      email: createUserDto.email,
      name: createUserDto.name,
      birthday: createUserDto.birthday,
      password: hashedPassword,
    };

    const accessToken = 'access_token_mock';
    const refreshToken = 'refresh_token_mock';

    it('should successfully register a new user', async () => {
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockUserService.create.mockResolvedValue(createdUser);
      mockTokenService.generateTokens.mockReturnValue({
        accessToken,
        refreshToken,
      });

      const result = await service.createUser(createUserDto);

      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(tokenService.generateTokens).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual({
        user: createdUser,
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockUserService.create.mockRejectedValue(
        new ConflictException('A user with the given unique field already exists.')
      );

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException
      );
      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
    });

    it('should throw error if hash service fails', async () => {
      mockHashService.hash.mockRejectedValue(new Error('Hash failed'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Hash failed'
      );
      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userService.create).not.toHaveBeenCalled();
    });
  });
});
