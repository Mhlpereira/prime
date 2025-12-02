import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { payloadTokenDto } from "./dto/payload-token.dto";
import { HashService } from "src/common/hash/hash.service";
import { UserService } from "src/user/user.service";
import { User } from "generated/prisma";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly hashService: HashService,
        private readonly userService: UserService
    ) {}

    async createUser(
        dto: CreateUserDto
    ): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
        const hashedPassword = await this.hashService.hash(dto.password);

        const user = await this.userService.create({
            ...dto,
            password: hashedPassword,
        });

        const tokens = await this.tokensGenerate({
            sub: user.id,
            email: user.email,
            name: user.name,
        });

        return { user, tokens };
    }

    async tokensGenerate(payload: payloadTokenDto) {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_SECRET"),
            expiresIn: "30m",
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH"),
            expiresIn: "30d",
        });

        return { accessToken, refreshToken };
    }
}
