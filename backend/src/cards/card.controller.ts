import { Body, Controller, Get, Param } from '@nestjs/common';
import { CardService } from './card.service';
import createHttpError from 'http-errors';
import { Public } from '@app/utils/public.decorator';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.cardService.getCardDataByCardId(id);
  }

  @Public()
  @Get('list')
  findMany(@Body() ids: string[]) {
    return this.cardService.getManyCardDataByCardIds(ids);
  }

  @Public()
  @Get('byName/:name')
  findByName(@Param('name') name: string) {
    return this.cardService.getCardByName(name);
  }
}
