import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Format } from '../../../generated/prisma/enums';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Format)
  format: Format;
}
