import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Card, CardData } from '../../generated/prisma/client';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async getCardById(id: string): Promise<Card | null> {
    return this.prisma.card.findUnique({ where: { id } });
  }

  async getCardDataByCardId(id: string): Promise<CardData | null> {
    return this.prisma.cardData.findUnique({ where: { cardId: id } });
  }

  async getManyCardDataByCardIds(ids: string[]): Promise<CardData[]> {
    return this.prisma.cardData.findMany({ where: { cardId: { in: ids } } });
  }

  async getCardByName(name: string): Promise<CardData | null> {
    return this.prisma.cardData.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }
}
