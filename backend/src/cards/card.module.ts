import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { PrismaService } from '@app/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
