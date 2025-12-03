import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LogoutDto {

    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
