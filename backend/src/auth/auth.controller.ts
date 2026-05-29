import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public } from '@app/utils/public.decorator';
import { LoginUserDto, RegisterUserDto } from './dto/auth';
import { Response } from 'express';
import { THIRTY_DAYS } from '@app/constants';
import { RtGuard } from '@app/utils/refresh.guard';
import { GetRefreshToken, GetRt } from '@app/utils/getRt.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    const user = await this.authService.register(registerDto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const response = await this.authService.login(loginDto);

    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      maxAge: THIRTY_DAYS,
    });

    res.status(201).json({
      accessToken: response.accessToken,
      userId: response.userId,
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('responseId');
    res.clearCookie('refreshToken');

    res.status(204).send();
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(@Res() res: Response, @GetRt() user: GetRefreshToken) {
    const response = await this.authService.refresh(user.email, user.refreshToken);

    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      maxAge: THIRTY_DAYS,
    });

    res.status(201).json({
      accessToken: response.accessToken,
      userId: response.userId,
    });
  }
}
