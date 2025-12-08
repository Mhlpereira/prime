import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
