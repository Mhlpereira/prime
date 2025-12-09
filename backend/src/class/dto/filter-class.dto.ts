import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ClassVisibility } from './create-class.dto';

export class FilterClassDto {
  @IsString()
  @IsOptional()
  gymId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  instructorId?: string;

  @IsEnum(ClassVisibility)
  @IsOptional()
  visibility?: ClassVisibility;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
