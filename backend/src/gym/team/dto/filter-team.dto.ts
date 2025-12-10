import { IsString, IsOptional } from "class-validator";

export class FilterTeamDto {
    @IsString()
    @IsOptional()
    gymId?: string;

    @IsString()
    @IsOptional()
    sportId?: string;

    @IsString()
    @IsOptional()
    name?: string;
}
