import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { CreateTransactionsUseCase } from "../../application/use-cases/create-transactions.use-case";
import { CreateTransactionsDTO } from "../dtos/create-transactions.dto";
import { Card } from "../../domain/card.entity";

@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly createTX: CreateTransactionsUseCase
  ) { }

  @Post()
  async pay(@Body() body: CreateTransactionsDTO) {
    const { infoCard, paymentMethod, amount, reference, product_id: productId, quantity } = body;
    const card = Card.fromDTO(infoCard);
    const result = await this.createTX.execute({ infoCard: card, paymentMethod, amount, reference, productId, quantity });

    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return result.data;
  }
}
