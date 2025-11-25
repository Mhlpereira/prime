import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @IsOptional()
    @IsEmail()
    email?: string | undefined;

    @IsOptional()
    @IsString()
    name?: string | undefined;

    @IsOptional()
    @IsDate()
    birthday?: Date | undefined;
}
