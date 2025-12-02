import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HashService } from '../common/hash/hash.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let hashService: HashService;
  let jwtService: JwtService;

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockHashService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH') return 'test-refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    hashService = module.get<HashService>(HashService);
    jwtService = module.get<JwtService>(JwtService);
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
      mockJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.createUser(createUserDto);

      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
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

  describe('tokensGenerate', () => {
    const payload = {
      sub: '01JDXXXXX',
      email: 'test@example.com',
      name: 'Test User',
    };

    const accessToken = 'access_token_mock';
    const refreshToken = 'refresh_token_mock';

    it('should generate access and refresh tokens', async () => {
      mockJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = await service.tokensGenerate(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'test-secret',
        expiresIn: '30m',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'test-refresh-secret',
        expiresIn: '30d',
      });
      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });
});
