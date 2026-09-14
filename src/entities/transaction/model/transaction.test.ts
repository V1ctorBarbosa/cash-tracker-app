import { getPaymentMethodLabel, PaymentMethod } from './transaction';

// This module also exports TanStack Query hooks that import the Firebase client -- mocked here
// so this file's pure functions can be tested without pulling in AsyncStorage's native module.
jest.mock('@/shared/api/firebase', () => ({ auth: {} }));

describe('getPaymentMethodLabel', () => {
  test.each([
    [PaymentMethod.Pix, 'Pix'],
    [PaymentMethod.Dinheiro, 'Dinheiro'],
    [PaymentMethod.CartaoDebito, 'Cartão Débito'],
    [PaymentMethod.CartaoCredito, 'Cartão Crédito'],
    [PaymentMethod.TransferenciaBancaria, 'Transferência'],
    [PaymentMethod.Boleto, 'Boleto'],
    [PaymentMethod.Outro, 'Outro'],
  ])('translates %s to %s', (paymentMethod, expectedLabel) => {
    expect(getPaymentMethodLabel(paymentMethod)).toBe(expectedLabel);
  });

  test('falls back to the raw value for an unrecognized payment method', () => {
    expect(getPaymentMethodLabel('SomethingNew')).toBe('SomethingNew');
  });
});
