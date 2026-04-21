const { add, subtract } = require('../utils/math');

describe('Operaciones matemáticas', () => {
  test('add: Suma 2 números', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('subtract: Resta 2 números', () => {
    expect(subtract(5, 2)).toBe(3);
  });
});
