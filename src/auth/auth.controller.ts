import { Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login() {
    
  }

  @Post('register')
  @ApiOperation({ summary: 'Cria um novo usuário'})
  @ApiResponse({status: 201, description: 'Usuário criado com sucesso' })
  async register(createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(){

  }
}
