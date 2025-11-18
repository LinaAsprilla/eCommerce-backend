export class Card {
  constructor(
    public readonly cardNumber: string,
    public readonly cvc: string,
    public readonly expMonth: string,
    public readonly expYear: string,
    public readonly cardHolder: string
  ) { }

  static fromDTO(data: any): Card {
    return new Card(
      data.card_number,
      data.cvc,
      data.exp_month,
      data.exp_year,
      data.card_holder
    );
  }

  private getDigits(): string {
    const number = this.cardNumber
    return number.replaceAll(/\D/g, "");
  }

  static luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.replaceAll(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(digits[i], 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  isExpired(): boolean {
    const now = new Date();
    const year = 2000 + Number(this.expYear);
    const month = Number(this.expMonth) - 1;
    const exp = new Date(year, month + 1, 1);
    return exp < now;
  }

  isValidExpYear(): boolean {
    const currentYear = new Date().getFullYear() - 2000;
    const year = Number(this.expYear);
    return year >= currentYear && year <= currentYear + 20;
  }

  getCardType(): string {
    const digits = this.getDigits();
    if (digits.startsWith("4")) return 'VISA';
    if (/^5[1-5]/.test(digits)) return 'MASTERCARD';
    if (/^3[47]/.test(digits)) return 'AMEX';
    if (/^6(?:011|5)/.test(digits)) return 'DISCOVER';
    return 'UNKNOWN';
  }

  getBin(): string {
    const digits = this.getDigits();
    return digits.substring(0, 6);
  }

  getLastFour(): string {
    const digits = this.getDigits();
    return digits.substring(digits.length - 4);
  }

  generateCardName(): string {
    const brand = this.getCardType();
    const lastFour = this.getLastFour();
    return `${brand}-${lastFour}`;
  }
}
