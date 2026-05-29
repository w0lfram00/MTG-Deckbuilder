import { Body, Controller, Delete, Get, HttpCode, Patch } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'crypto';
import createHttpError from 'http-errors';
import { UserService } from './user.service';
import { UpdateUserDto, UserData } from '@app/auth/dto/auth';
import { GetUser } from '@app/utils/user.decorator';
import { getEnv } from '@app/utils/getEnv';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getCurUserInfo(@GetUser() user: UserData) {
    return user;
  }

  @Patch()
  async updateCurUser(@GetUser() user: UserData, @Body() updateDto: UpdateUserDto) {
    const response = await this.userService.updateUser(user.id, updateDto);
    const accessToken = await this.jwtService.signAsync(
      {
        sub: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      },
      { secret: getEnv('JWT_SECRET_ACCESS') },
    );
    return { accessToken, userId: response.id };
  }

  @Delete()
  async deleteCurUser(@GetUser() user: UserData) {
    return (await this.userService.deleteUser(user.id)).id;
  }

  @Patch('password')
  async updateCurPassword(
    @GetUser() user: UserData,
    @Body()
    { password, newPassword }: { password: string; newPassword: string },
  ) {
    const hashedPassword = hash('sha256', password);
    const response = await this.userService.getUserByEmail(user.email);
    if (response?.password != hashedPassword) throw createHttpError(403, 'Wrong password');

    const newHashedPassword = hash('sha256', newPassword);

    await this.userService.updateUser(user.id, {
      password: newHashedPassword,
    });
    return { success: true };
  }

  @Patch('password/reset')
  async resetCurPassword(
    @GetUser() user: UserData,
    @Body()
    { password }: { password: string },
  ) {
    const newHashedPassword = hash('sha256', password);

    await this.userService.updateUser(user.id, {
      password: newHashedPassword,
    });
    return { success: true };
  }
}
