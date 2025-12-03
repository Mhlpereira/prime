import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/auth.constants';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TokenModule } from '../common/token/token.module';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({}),
    TokenModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
