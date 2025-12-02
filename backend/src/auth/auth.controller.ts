import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FastifyReply } from "fastify";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @HttpCode(200)
    async login() {}
    @Post("register")
    @ApiOperation({ summary: "Cria um novo usuário" })
    @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
    async register(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) reply: FastifyReply) {
        const { user, tokens } = await this.authService.createUser(createUserDto);

        return {
            user: {
                email: user.email,
                name: user.name,
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    @Post("logout")
    @HttpCode(200)
    async logout() {}
}
