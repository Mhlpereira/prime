import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {

        constructor(@InjectModel("User") private userModel: Model<UserDocument>) {}
    
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
}
