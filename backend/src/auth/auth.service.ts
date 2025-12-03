import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { HashService } from "../common/hash/hash.service";
import { UserService } from "../user/user.service";
import { User } from "../../generated/prisma";
import { LoginDto } from "./dto/login-dto";
import { TokenService } from "../common/token/token.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly hashService: HashService,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly prisma: PrismaService
    ) {}

    async createUser(
        dto: CreateUserDto
    ): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
        const hashedPassword = await this.hashService.hash(dto.password);

        const user = await this.userService.create({
            ...dto,
            password: hashedPassword,
        });

        const tokens = this.tokenService.generateTokens(user);

        return { user, tokens };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.validate(loginDto);
        const tokens = this.tokenService.generateTokens(user);
        return { user, tokens };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
}
