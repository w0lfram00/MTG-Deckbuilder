import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeckModule } from './decks/deck.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, DeckModule, UserModule],
})
export class AppModule {}
