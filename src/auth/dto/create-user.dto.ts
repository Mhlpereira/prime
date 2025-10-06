import { IsEmail, IsISO8601, IsNotEmpty, IsString } from "class-validator";
import { Transform } from 'class-transformer';


export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @Transform(({ value }) => new Date(value))  
    @IsISO8601()
    @IsNotEmpty()
    birthday: Date;
}
