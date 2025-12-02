import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        try {
            const user = await this.prisma.user.create({
                data: createUserDto,
            });
            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new ConflictException("A user with the given unique field already exists.");
                }
                if (error.code === "P2003") {
                    throw new BadRequestException("Foreign key constraint failed.");
                }
                if (error.code === "P2025") {
                    throw new NotFoundException("Record not found.");
                }
            }
            if (error instanceof Prisma.PrismaClientValidationError) {
                throw new BadRequestException("Invalid data provided.");
            }
            throw new InternalServerErrorException("An unexpected error occurred.");
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
