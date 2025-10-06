import { Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login() {
    
  }

  @Post('register')
  @HttpCode(201)
  async register(createUserDto: CreateUserDto) {
    
  }

  @Post('logout')
  @HttpCode(200)
  async logout(){

  }
}
