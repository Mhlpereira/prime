import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';

export enum ClassVisibility {
  GYM = 'GYM',
  TEAM = 'TEAM',
  PRIVATE = 'PRIVATE',
}

export class CreateClassDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ClassVisibility)
  @IsOptional()
  visibility?: ClassVisibility = ClassVisibility.TEAM;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxStudents?: number;

  @IsString()
  @IsNotEmpty()
  teamId: string;
}
