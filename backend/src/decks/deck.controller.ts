import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import createHttpError from 'http-errors';
import { Public } from '@app/utils/public.decorator';
import { GetUser } from '@app/utils/user.decorator';
import { UserData } from '@app/auth/dto/auth';
import { CardService } from '@app/cards/card.service';
import { Card } from 'generated/prisma/client';
import { AddCardDto } from './dto/add-card.dto';

@Controller('decks')
export class DecksController {
  constructor(
    private readonly deckService: DeckService,
    private readonly cardService: CardService,
  ) {}

  @Post()
  create(@Body() createDeckDto: CreateDeckDto, @GetUser() user: UserData) {
    return this.deckService.createDeck({ userId: user.id, ...createDeckDto });
  }

  @Post(':deckId/setCards')
  async setCardToDeck(
    @Body() addCardDto: AddCardDto,
    @Param('deckId') deckId: string,
    @GetUser() user: UserData,
  ) {
    const deck = await this.deckService.findDeck(deckId);
    if (!deck) throw createHttpError(404, 'Deck not found!');
    if (deck.userId != user.id)
      throw createHttpError(403, 'You are not authorized to add a card to this deck!');
    const decklist = await this.getDecklist(deck.id);
    const isInDeck = decklist.some((card) => card.id == addCardDto.cardId);
    // Delete from db if quantity = 0
    if (isInDeck && addCardDto.quantity == 0)
      return this.deckService.removeCardFromDeck(deckId, addCardDto.cardId);
    if (isInDeck) return this.deckService.editCardInDeck(deckId, addCardDto);
    else if (!isInDeck && addCardDto.quantity > 0)
      return this.deckService.addCardToDeck(deckId, addCardDto);
    else throw createHttpError(400, 'Bad request!');
  }

  @Public()
  @Get(':id')
  findDeckById(@Param('id') id: string) {
    return this.deckService.findDeck(id);
  }

  @Public()
  @Get('user/:userId')
  findDecksByUserId(@Param('userId') userId: string) {
    return this.deckService.findDecksByUserId(userId);
  }

  @Public()
  @Get(':id/decklist')
  getDecklist(@Param('id') id: string) {
    return this.deckService.getDecklistById(id);
  }

  @Public()
  @Get(':id/cardsData')
  async getCardsByDeckId(@Param('id') deckId: string) {
    const deck = await this.deckService.findDeck(deckId);
    if (!deck) throw createHttpError(404, 'Deck not found');
    return this.deckService.getDecklistById(deckId, true);
  }
}
