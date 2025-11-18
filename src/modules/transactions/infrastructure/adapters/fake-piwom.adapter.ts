import { Injectable } from "@nestjs/common";
import { Card } from "../../domain/card.entity";
import { FakePiwomPort, CardTokenResponse, TransactionResponse } from "../../application/ports/fake-piwom.port";
import { PaymentMethod } from "../../domain/payment-method.entity";

@Injectable()
export class FakePiwomAdapter implements FakePiwomPort {
  /**
   * Simula la tokenización de una tarjeta según la especificación de Piwom
   * @param card Entidad Card con los datos de la tarjeta
   * @returns CardTokenResponse con el formato de respuesta de Piwom
   */
  async tokenizeCard(card: Card): Promise<CardTokenResponse> {

    // Generar ID de token realista en formato Piwom: tok_prod_1_[32 caracteres aleatorios]
    const tokenId = this.generateTokenId();


    const response: CardTokenResponse = {
      status: 'CREATED',
      data: {
        id: tokenId,
        created_at: new Date().toISOString(),
        brand: card.getCardType(),
        name: card.generateCardName(),
        last_four: card.getLastFour(),
        bin: card.getBin(),
        exp_year: card.expYear,
        exp_month: card.expMonth,
        card_holder: card.cardHolder,
      }
    };

    return response;
  }

  /**
   * Simula la creación de una transacción con tarjeta de crédito según la especificación de Piwom
   * @param paymentMethod Método de pago con el token de tarjeta
   * @param amountInCents Monto de la transacción en centavos
   * @param reference Referencia única de la transacción
   * @returns TransactionResponse con el formato de respuesta de Piwom
   */
  async createTransaction(
    paymentMethod: PaymentMethod,
    amountInCents: number,
    reference: string,
  ): Promise<TransactionResponse> {
    // Generar un ID de transacción realista en formato Piwom
    const transactionId = this.generateTransactionId();

    // Simular diferentes estados de transacción (en un escenario real, esto vendría del procesador)
    // Para este simulador, usaremos lógica básica para decidir si aprueba o rechaza
    const status = this.simulateTransactionStatus(amountInCents);
    const statusMessage = this.getStatusMessage(status);
    const processorResponseCode = this.generateProcessorResponseCode(status);

    // Extraer información de la tarjeta del token (en un escenario real, esto vendría del servidor de Piwom)
    const cardInfo = this.extractCardInfoFromToken(paymentMethod.token);

    const response: TransactionResponse = {
      status: status as "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING",
      data: {
        id: transactionId,
        created_at: new Date().toISOString(),
        amount_in_cents: amountInCents,
        reference: reference,
        currency: "COP",
        payment_method_type: "CARD",
        payment_method: {
          type: paymentMethod.type,
          installments: paymentMethod.installments,
          extra: {
            name: cardInfo.name,
            brand: cardInfo.brand,
            last_four: cardInfo.lastFour,
            processor_response_code: processorResponseCode,
          },
        },
        status: status,
        status_message: statusMessage,
        merchant: {
          id: 1,
          name: "Test Merchant",
          legal_name: "Test Merchant S.A.S.",
          contact_name: "John Doe",
          phone_number: "+573001111111",
          logo_url: null,
          legal_id_type: "NIT",
          email: "merchant@example.com",
          legal_id: "100111111-01",
        },
      },
    };

    return response;
  }

  /**
   * Genera un ID de token en formato Piwom: tok_prod_1_[caracteres aleatorios]
   * Formato: tok_prod_1_BBb749EAB32e97a2D058Dd538a608301 (32 caracteres hexadecimales)
   */
  private generateTokenId(): string {
    const prefix = 'tok_prod_1_';
    const randomChars = Array.from({ length: 32 }, () => {
      const chars = '0123456789ABCDEFabcdef';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join('');

    return prefix + randomChars;
  }

  /**
   * Genera un ID de transacción en formato Piwom
   * Formato: XXXX-XXXXXXXXXX-XXXXX
   */
  private generateTransactionId(): string {
    const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const part2 = Math.floor(Date.now() / 1000).toString();
    const part3 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

    return `${part1}-${part2}-${part3}`;
  }

  /**
   * Simula el estado de la transacción basado en el monto
   * - Montos > $5,000,000 son rechazados (límite máximo)
   * - Montos < $1,000 son rechazados (límite mínimo)
   * - De otro modo, 90% de probabilidad de aprobación
   */
  private simulateTransactionStatus(amountInCents: number): string {
    if (amountInCents > 500000000) {
      return "DECLINED";
    }

    if (amountInCents < 100) {
      return "DECLINED";
    }

    const random = Math.random();
    return random < 0.9 ? "APPROVED" : "DECLINED";
  }

  private getStatusMessage(status: string): string | null {
    const messages: { [key: string]: string } = {
      APPROVED: "Transacción aprobada",
      DECLINED: "Fondos Insuficientes",
      VOIDED: "Transacción anulada",
      ERROR: "Error en la transacción",
      PENDING: "Transacción pendiente",
    };

    return messages[status] || null;
  }


  private generateProcessorResponseCode(status: string): string {
    const responseCodes: { [key: string]: string[] } = {
      APPROVED: ["00", "01", "02"],
      DECLINED: ["51", "05", "14"],
      ERROR: ["99"],
    };

    const codes = responseCodes[status] || ["99"];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  /**
   * Extrae información simulada de la tarjeta basada en el token
   * En un escenario real, esto vendría de un servidor seguro de Piwom
   */
  private extractCardInfoFromToken(token: string): {
    name: string;
    brand: string;
    lastFour: string;
  } {
    const brands = ["VISA", "MASTERCARD", "AMEX"];
    const names = ["VISA-4242", "MASTERCARD-5555", "AMEX-3782"];

    const randomIndex = Math.floor(Math.random() * brands.length);

    return {
      brand: brands[randomIndex],
      name: names[randomIndex],
      lastFour: this.generateRandomCardLastFour(),
    };
  }

  /**
   * Genera los últimos 4 dígitos aleatorios de una tarjeta
   */
  private generateRandomCardLastFour(): string {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
  }
}
