import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants, jwtRefreshToken } from './constants/auth.constants';
import { payloadTokenDto } from './dto/payload-token.dto';

@Injectable()
export class AuthService {

        constructor(@InjectModel("User") private userModel: Model<UserDocument>, private readonly jwtService: JwtService) {}
    
        async createUser(createUserDto: CreateUserDto) {
            try {
                const createdUser = new this.userModel(createUserDto);
                return createdUser.save();
            } catch (error) {
                if (error === 11000) {
                    throw new ConflictException("E-mail já está em uso");
                } else if (error.name === "ValidationError") {
                    throw new BadRequestException(error.message);
                }
                console.error(error);
                throw new InternalServerErrorException("Erro ao criar usuário");
            }
        }


        
        async tokensGenerate(payload: payloadTokenDto) {
            const accessToken = this.jwtService.sign(payload, {
                secret: jwtConstants.secret,
                expiresIn: '30m'
            });

            const refreshToken = this.jwtService.sign(payload, {
                secret: jwtRefreshToken.secret,
                expiresIn: '30d'
            });

            return { accessToken, refreshToken };
        }
}
