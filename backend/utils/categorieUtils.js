const normaliserCategories = (value) => {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(rawValues
    .map((item) => (item || '').trim())
    .filter(Boolean))];
};

const serialiserCategories = (value) => normaliserCategories(value).join(',');

module.exports = {
  normaliserCategories,
  serialiserCategories
};
