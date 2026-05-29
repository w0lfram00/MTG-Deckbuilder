import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Format } from '../../generated/prisma/enums';
import { Card, Deck, DeckCard } from '../../generated/prisma/client';
import { CardService } from '@app/cards/card.service';
import { CardData } from 'generated/prisma/browser';
import { AddCardDto, EditCardDto } from './dto/add-card.dto';

@Injectable()
export class DeckService {
  constructor(
    private prisma: PrismaService,
    private cardService: CardService,
  ) {}

  async createDeck(data: { name: string; format: Format; userId: string }): Promise<Deck> {
    return this.prisma.deck.create({ data });
  }

  async findDeck(id: string): Promise<Deck | null> {
    return this.prisma.deck.findUnique({ where: { id } });
  }

  async findDecksByName(name: string[]): Promise<Deck[]> {
    return this.prisma.deck.findMany({ where: { name: { in: name } } });
  }

  async findDecksByUserId(userId: string): Promise<Deck[]> {
    return this.prisma.deck.findMany({ where: { userId } });
  }

  async editDeck(deckId: string, data: Partial<Deck>): Promise<Deck> {
    return this.prisma.deck.update({ where: { id: deckId }, data });
  }

  async addCardToDeck(deckId: string, cardDto: AddCardDto): Promise<DeckCard> {
    return this.prisma.deckCard.create({ data: { deckId, ...cardDto } });
  }
  async removeCardFromDeck(deckId: string, cardId: string): Promise<void> {
    await this.prisma.deckCard.delete({ where: { deckId_cardId: { deckId, cardId } } });
  }
  async editCardInDeck(deckId: string, cardDto: EditCardDto): Promise<DeckCard> {
    return this.prisma.deckCard.update({
      where: { deckId_cardId: { deckId, cardId: cardDto.cardId } },
      data: cardDto,
    });
  }

  async getDecklistById(id: string): Promise<(Card & { quantity: number })[]>;
  async getDecklistById(id: string, cardData: false): Promise<(Card & { quantity: number })[]>;
  async getDecklistById(id: string, cardData: true): Promise<(CardData & { quantity: number })[]>;
  async getDecklistById(
    id: string,
    cardData?: boolean,
  ): Promise<((Card | CardData) & { quantity: number })[]> {
    const response = await this.prisma.deckCard.findMany({
      where: { deckId: id },
      orderBy: { cardId: 'asc' },
      include: { card: !cardData },
    });
    if (!cardData) {
      return response.map((deckCard: DeckCard & { card: Card }) => ({
        ...deckCard.card,
        quantity: deckCard.quantity,
      }));
    } else {
      const cardIds = response.map((card) => card.cardId);
      const cardsData = await this.prisma.cardData.findMany({
        where: { cardId: { in: cardIds } },
        orderBy: { cardId: 'asc' },
      });
      return response.map((deckCard, index) => ({
        ...cardsData[index],
        quantity: deckCard.quantity,
      }));
    }
  }
}
