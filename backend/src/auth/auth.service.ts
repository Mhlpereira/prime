import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { payloadTokenDto } from './dto/payload-token.dto';

@Injectable()
export class AuthService {

        constructor(
            private readonly jwtService: JwtService,
            private readonly configService: ConfigService
        ) {}
    
        async createUser(createUserDto: CreateUserDto) {
        }


        
        async tokensGenerate(payload: payloadTokenDto) {
            const accessToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '30m'
            });

            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_REFRESH'),
                expiresIn: '30d'
            });

            return { accessToken, refreshToken };
        }
}
