import { Body, Controller, HttpCode, Post, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { plainToClass } from "class-transformer";
import { FastifyReply } from "fastify";
import { OutputRegisterDto } from "./dto/register-output.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @HttpCode(200)
    async login() {}
    @Post("register")
    @ApiOperation({ summary: "Cria um novo usuário" })
    @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
    async register(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) reply: FastifyReply): Promise<OutputRegisterDto> {

        const { user, accessToken, refreshToken } = await this.authService.createUser(createUserDto);

        if (!user) {
            throw new UnauthorizedException("Erro ao registrar usuário");
        }

        reply.setCookie("access_token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 2 * 60 * 60, // segundos (2h)
            path: "/",
        });

        reply.setCookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60, // segundos (30 dias)
            path: "/",
        });

        return plainToClass(OutputRegisterDto, user);
    }

    @Post("logout")
    @HttpCode(200)
    async logout() {}
}
