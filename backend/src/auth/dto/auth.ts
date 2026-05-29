import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsPhoneNumber, IsString, Length } from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class RegisterUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @Length(8, 16)
  password: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @Length(8, 16)
  password: string;
}

export interface RefreshUserDto {
  sessionId: string;
  refreshToken: string;
}

export interface UserData {
  email: string;
  id: string;
  name: string;
  role: Role;
}

export class UpdateUserDto extends PartialType(OmitType(RegisterUserDto, ['password'] as const)) {}
