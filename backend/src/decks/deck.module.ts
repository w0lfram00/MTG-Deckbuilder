import { Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DecksController } from './deck.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CardModule } from '@app/cards/card.module';
import { CardService } from '@app/cards/card.service';

@Module({
  imports: [CardModule],
  controllers: [DecksController],
  providers: [DeckService, CardService],
})
export class DeckModule {}
