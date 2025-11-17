import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class DecreaseStockDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
