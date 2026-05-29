import { RegisterUserDto } from '@app/auth/dto/auth';
import { PrismaService } from '@app/prisma/prisma.service';
import { Get, Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
    });
  }

  async createUser(userDto: RegisterUserDto) {
    return await this.prisma.user.create({
      data: { ...userDto },
    });
  }

  async updateUser(id: string, updateDto: Partial<User>) {
    return await this.prisma.user.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteUser(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
