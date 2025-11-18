import { Controller, Get, Param, HttpException, HttpStatus } from "@nestjs/common";
import { ListProductsUseCase } from "../../application/use-cases/list-products.use-case";
import { GetProductUseCase } from "../../application/use-cases/get-product.use-case";
import { GetProductDto } from "../dtos/get-product.dto";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase
  ) { }

  @Get()
  async list() {
    const result = await this.listProducts.execute();

    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return result.data;
  }

  @Get(":id")
  async getOne(@Param() params: GetProductDto) {
    const result = await this.getProduct.execute(params.id);

    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }

    return result.data;
  }
}
