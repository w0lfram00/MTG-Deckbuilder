import { Injectable } from '@nestjs/common';
import { hash } from 'crypto';
import createHttpError from 'http-errors';
import { LoginUserDto, RegisterUserDto, UserData } from './dto/auth';
import { PrismaService } from '@app/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { getEnv } from '@app/utils/getEnv';
import { THIRTY_MINUTES } from '@app/constants';
import { UserService } from '@app/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly user: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<UserData> {
    const user = await this.user.getUserByEmail(registerDto.email);
    if (user) throw createHttpError(409, 'Email is in use');

    const hashedPassword = hash('sha256', registerDto.password);

    const newUser = await this.user.createUser({
      ...registerDto,
      password: hashedPassword,
    });
    return {
      email: newUser.email,
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
    };
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.user.getUserByEmail(loginDto.email);
    if (!user) throw createHttpError(404, 'User not found');

    const isEqual = hash('sha256', loginDto.password) == user.password;
    if (!isEqual) throw createHttpError(401, 'Unauthorized');

    const { accessToken, refreshToken } = await this.makeTokens(user);
    const hashed_rt = hash('sha256', refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashed_rt },
    });

    return { userId: user.id, accessToken, refreshToken };
  }

  async refresh(userEmail: string, token: string) {
    const user = await this.user.getUserByEmail(userEmail);
    const isEqual = hash('sha256', token) == user?.hashed_rt;
    if (!isEqual) throw createHttpError(403, 'Unauthorized');

    const { accessToken, refreshToken } = await this.makeTokens(user);

    const hashed_rt = hash('sha256', refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashed_rt },
    });

    return { userId: user.id, accessToken, refreshToken };
  }

  async noPasswordLogin(email: string) {
    const user = await this.user.getUserByEmail(email);
    if (!user) throw createHttpError(404, 'User not found');
    console.log(user);

    const { accessToken, refreshToken } = await this.makeTokens(user);
    const hashed_rt = hash('sha256', refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashed_rt },
    });

    return { userId: user.id, accessToken, refreshToken };
  }

  private async makeTokens(user: UserData) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      {
        secret: getEnv('JWT_SECRET_ACCESS'),
        expiresIn: THIRTY_MINUTES,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: getEnv('JWT_SECRET_ACCESS'),
      },
    );
    return { accessToken, refreshToken };
  }
}
