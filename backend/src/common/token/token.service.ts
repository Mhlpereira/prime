import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";

export interface TokenPayload {
    sub: string;
    email: string;
    name: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    generateTokens(user: User): TokenResponse {
        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

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

    verifyAccessToken(token: string): TokenPayload {
        return this.jwtService.verify(token, {
            secret: this.configService.get<string>("JWT_SECRET"),
        });
    }

    verifyRefreshToken(token: string): TokenPayload {
        return this.jwtService.verify(token, {
            secret: this.configService.get<string>("JWT_REFRESH"),
        });
    }
}
