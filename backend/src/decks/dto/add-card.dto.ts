import { IsNumber, IsUUID } from 'class-validator';

export class AddCardDto {
  @IsUUID()
  cardId: string;
  @IsNumber()
  quantity: number;
}

export class EditCardDto {
  @IsUUID()
  cardId: string;
  @IsNumber()
  quantity: number;
}
