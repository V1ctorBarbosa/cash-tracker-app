import { buildTransactionsUrl, getPaymentMethodLabel, PaymentMethod } from './transaction';

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

describe('buildTransactionsUrl', () => {
  test('omits the query string entirely when no filter is given', () => {
    expect(buildTransactionsUrl({})).toBe('/transactions');
  });

  test('includes from and to when both are given', () => {
    expect(buildTransactionsUrl({ from: '2026-09-01', to: '2026-09-30' })).toBe('/transactions?from=2026-09-01&to=2026-09-30');
  });

  test('includes only tagId when it is the only filter given', () => {
    expect(buildTransactionsUrl({ tagId: 'tag-mercado' })).toBe('/transactions?tagId=tag-mercado');
  });

  test('combines every given filter', () => {
    const url = buildTransactionsUrl({ from: '2026-09-01', to: '2026-09-30', tagId: 'tag-mercado' });

    expect(url).toBe('/transactions?from=2026-09-01&to=2026-09-30&tagId=tag-mercado');
  });
});
