import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    openTime?: string;

    @IsString()
    @IsOptional()
    closeTime?: string;

    @IsString()
    @IsNotEmpty()
    gymId: string;

    @IsString()
    @IsNotEmpty()
    sportId: string;
}
