import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./entities/user.entity";
import { Model } from "mongoose";

@Injectable()
export class UserService {
    constructor(@InjectModel("User") private userModel: Model<UserDocument>) {}

    async create(createUserDto: CreateUserDto) {
        try {
            const createdUser = new this.userModel(createUserDto);
            return await createdUser.save();
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

    findAll() {
        return `This action returns all user`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
