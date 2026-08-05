const validerStockDisponible = (plat, quantiteDemandee = 1) => {
  if (!plat) return false;
  if (typeof plat.stock !== 'number') return true;
  return plat.stock >= quantiteDemandee;
};

module.exports = { validerStockDisponible };
