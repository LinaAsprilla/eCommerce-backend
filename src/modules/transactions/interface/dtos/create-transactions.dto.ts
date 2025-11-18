import { IsNotEmpty, IsString, Length, Matches, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PaymentType } from "../../domain/payment-method.entity";
export class CardInfoDTO {
  @IsString()
  @Matches(/^\d+$/)
  @Length(13, 19)
  card_number: string;

  @IsString()
  @Matches(/^\d+$/)
  @Length(3, 4)
  cvc: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/)
  exp_month: string;

  @IsString()
  @Matches(/^\d+$/)
  @Length(2, 2)
  exp_year: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/)
  card_holder: string;
}

export class PaymentMethodDTO {
  @IsNotEmpty()
  type: PaymentType;

  @IsNotEmpty()
  installments: number;
}

export class CreateTransactionsDTO {
  @ValidateNested()
  @Type(() => CardInfoDTO)
  infoCard: CardInfoDTO;

  @ValidateNested()
  @Type(() => PaymentMethodDTO)
  paymentMethod: PaymentMethodDTO;

  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  product_id?: string;

  @IsNotEmpty()
  quantity?: number;
}
