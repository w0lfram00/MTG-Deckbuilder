import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '@app/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from '@app/utils/auth.strategy';
import { RtStrategy } from '@app/utils/refresh.strategy';
import { AtGuard } from '@app/utils/auth.guard';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    AtStrategy,
    RtStrategy,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AuthModule {}
