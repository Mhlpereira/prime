import { IsEmail, IsISO8601, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: "email@example.com" })
    email: string;

    @IsNotEmpty()
    @ApiProperty({ example: "Password123!" })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "John Doe" })
    name: string;

    @Transform(({ value }) => new Date(value))
    @IsISO8601()
    @IsNotEmpty()
    @ApiProperty({ example: "1995-06-15", description: "Data de nascimento (ISO 8601)" })
    birthday: Date;
}
