const test = require('node:test');
const assert = require('node:assert/strict');
const { validerStockDisponible } = require('../utils/stockUtils');

test('un plat avec stock insuffisant ne peut pas être commandé', () => {
  const plat = { stock: 2 };
  assert.equal(validerStockDisponible(plat, 3), false);
});

test('un plat avec stock suffisant peut être commandé', () => {
  const plat = { stock: 5 };
  assert.equal(validerStockDisponible(plat, 2), true);
});

test('un plat sans stock est indisponible', () => {
  const plat = { stock: 0 };
  assert.equal(validerStockDisponible(plat, 1), false);
});
