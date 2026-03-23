// SQL query builder helpers
// Helps construct dynamic WHERE clauses safely

const buildWhereClause = (filters = {}) => {
  const conditions = [];
  const values = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      // IN clause
      const placeholders = value.map(() => '?').join(',');
      conditions.push(`${key} IN (${placeholders})`);
      values.push(...value);
    } else if (typeof value === 'object' && value.operator) {
      // Custom operator: { operator: '>=', value: 10 }
      conditions.push(`${key} ${value.operator} ?`);
      values.push(value.value);
    } else {
      conditions.push(`${key} = ?`);
      values.push(value);
    }
  }

  const whereClause = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  return { whereClause, values };
};

const buildSearchClause = (searchTerm, columns = []) => {
  if (!searchTerm || columns.length === 0) {
    return { searchClause: '', searchValues: [] };
  }

  const conditions = columns.map((col) => `${col} LIKE ?`);
  const searchClause = `(${conditions.join(' OR ')})`;
  const searchValues = columns.map(() => `%${searchTerm}%`);

  return { searchClause, searchValues };
};

module.exports = { buildWhereClause, buildSearchClause };
