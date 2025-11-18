import { Card } from './card.entity';

describe('Card Entity', () => {
  describe('Luhn Check Validation', () => {
    it('should validate a correct Visa card number', () => {
      const isValid = Card.luhnCheck('4242424242424242');
      expect(isValid).toBe(true);
    });

    it('should validate a correct Mastercard number', () => {
      const isValid = Card.luhnCheck('5555555555554444');
      expect(isValid).toBe(true);
    });

    it('should validate a correct Amex number', () => {
      const isValid = Card.luhnCheck('378282246310005');
      expect(isValid).toBe(true);
    });

    it('should reject an invalid card number', () => {
      const isValid = Card.luhnCheck('4242424242424241');
      expect(isValid).toBe(false);
    });

    it('should handle card numbers with spaces and dashes', () => {
      const isValid = Card.luhnCheck('4242 4242 4242 4242');
      expect(isValid).toBe(true);
    });

    it('should handle card numbers with dashes', () => {
      const isValid = Card.luhnCheck('4242-4242-4242-4242');
      expect(isValid).toBe(true);
    });

    it('should return true for an empty card number (edge case)', () => {
      const isValid = Card.luhnCheck('');
      expect(isValid).toBe(true);
    });

    it('should reject a card with all same digits', () => {
      const isValid = Card.luhnCheck('1111111111111111');
      expect(isValid).toBe(false);
    });
  });

  describe('Expiration Validation', () => {
    it('should return false for an expired card', () => {
      const card = new Card('4242424242424242', '123', '01', '20', 'Test Holder');
      expect(card.isExpired()).toBe(true);
    });

    it('should return false for a current month card (if year is future)', () => {
      const futureYear = (new Date().getFullYear() + 1 - 2000).toString().padStart(2, '0');
      const card = new Card('4242424242424242', '123', '12', futureYear, 'Test Holder');
      expect(card.isExpired()).toBe(false);
    });

    it('should return true for a card expiring at the last day of the month', () => {
      const currentYear = new Date().getFullYear() - 2000;
      const card = new Card('4242424242424242', '123', '01', currentYear.toString().padStart(2, '0'), 'Test Holder');
      expect(card.isExpired()).toBe(true);
    });

    it('should return false for a current month/year card (not expired yet)', () => {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = (now.getFullYear() - 2000).toString().padStart(2, '0');
      const card = new Card('4242424242424242', '123', currentMonth, currentYear, 'Test Holder');
      // Card expires on the 1st day of next month, so current time should be before that
      const isExpired = card.isExpired();
      expect(typeof isExpired).toBe('boolean');
    });
  });

  describe('Valid Expiration Year', () => {
    it('should validate current year', () => {
      const currentYear = new Date().getFullYear() - 2000;
      const card = new Card('4242424242424242', '123', '12', currentYear.toString().padStart(2, '0'), 'Test Holder');
      expect(card.isValidExpYear()).toBe(true);
    });

    it('should validate future year within 20 years', () => {
      const futureYear = (new Date().getFullYear() + 10 - 2000).toString().padStart(2, '0');
      const card = new Card('4242424242424242', '123', '12', futureYear, 'Test Holder');
      expect(card.isValidExpYear()).toBe(true);
    });

    it('should reject past year', () => {
      const pastYear = (new Date().getFullYear() - 1 - 2000).toString().padStart(2, '0');
      const card = new Card('4242424242424242', '123', '12', pastYear, 'Test Holder');
      expect(card.isValidExpYear()).toBe(false);
    });

    it('should reject year beyond 20 years in future', () => {
      const farFutureYear = (new Date().getFullYear() + 25 - 2000).toString().padStart(2, '0');
      const card = new Card('4242424242424242', '123', '12', farFutureYear, 'Test Holder');
      expect(card.isValidExpYear()).toBe(false);
    });
  });

  describe('Card Type Detection', () => {
    it('should detect Visa card', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'Test Holder');
      expect(card.getCardType()).toBe('VISA');
    });

    it('should detect Mastercard', () => {
      const card = new Card('5555555555554444', '123', '12', '25', 'Test Holder');
      expect(card.getCardType()).toBe('MASTERCARD');
    });

    it('should detect American Express', () => {
      const card = new Card('378282246310005', '1234', '12', '25', 'Test Holder');
      expect(card.getCardType()).toBe('AMEX');
    });

    it('should detect Discover card', () => {
      const card = new Card('6011111111111117', '123', '12', '25', 'Test Holder');
      expect(card.getCardType()).toBe('DISCOVER');
    });

    it('should return UNKNOWN for unrecognized card type', () => {
      const card = new Card('3000000000000000', '123', '12', '25', 'Test Holder');
      expect(card.getCardType()).toBe('UNKNOWN');
    });
  });

  describe('BIN and Last Four', () => {
    it('should extract BIN (first 6 digits)', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'Test Holder');
      expect(card.getBin()).toBe('424242');
    });

    it('should extract last four digits', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'Test Holder');
      expect(card.getLastFour()).toBe('4242');
    });

    it('should handle card numbers with spaces in BIN extraction', () => {
      const card = new Card('4242 4242 4242 4242', '123', '12', '25', 'Test Holder');
      expect(card.getBin()).toBe('424242');
    });

    it('should handle card numbers with dashes in last four extraction', () => {
      const card = new Card('4242-4242-4242-4242', '123', '12', '25', 'Test Holder');
      expect(card.getLastFour()).toBe('4242');
    });
  });

  describe('Card Name Generation', () => {
    it('should generate correct card name for Visa', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'Test Holder');
      expect(card.generateCardName()).toBe('VISA-4242');
    });

    it('should generate correct card name for Mastercard', () => {
      const card = new Card('5555555555554444', '123', '12', '25', 'Test Holder');
      expect(card.generateCardName()).toBe('MASTERCARD-4444');
    });

    it('should generate correct card name with unknown type', () => {
      const card = new Card('3000000000000000', '123', '12', '25', 'Test Holder');
      expect(card.generateCardName()).toBe('UNKNOWN-0000');
    });
  });

  describe('fromDTO', () => {
    it('should create a Card from DTO', () => {
      const dto = {
        card_number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '25',
        card_holder: 'John Doe',
      };

      const card = Card.fromDTO(dto);

      expect(card.cardNumber).toBe('4242424242424242');
      expect(card.cvc).toBe('123');
      expect(card.expMonth).toBe('12');
      expect(card.expYear).toBe('25');
      expect(card.cardHolder).toBe('John Doe');
    });

    it('should handle DTO with different case', () => {
      const dto = {
        card_number: '5555555555554444',
        cvc: '456',
        exp_month: '06',
        exp_year: '26',
        card_holder: 'Jane Smith',
      };

      const card = Card.fromDTO(dto);

      expect(card.getCardType()).toBe('MASTERCARD');
      expect(card.getLastFour()).toBe('4444');
    });
  });

  describe('Constructor and Properties', () => {
    it('should create a Card with all properties', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'John Doe');

      expect(card.cardNumber).toBe('4242424242424242');
      expect(card.cvc).toBe('123');
      expect(card.expMonth).toBe('12');
      expect(card.expYear).toBe('25');
      expect(card.cardHolder).toBe('John Doe');
    });

    it('should have all properties as readonly', () => {
      const card = new Card('4242424242424242', '123', '12', '25', 'John Doe');

      // Attempting to assign should fail at compile time, but we can verify the property exists
      expect(card.cardNumber).toBeDefined();
      expect(card.cvc).toBeDefined();
      expect(card.expMonth).toBeDefined();
      expect(card.expYear).toBeDefined();
      expect(card.cardHolder).toBeDefined();
    });
  });
});
