import { Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login() {

  }

  @Post('register')
  @HttpCode(201)
  async register() {

  }

  @Post('logout')
  @HttpCode(200)
  async logout(){

  }
}
