// utils/transaction.js
export const getTransactionDisplayName = (transaction) => {
  if (!transaction) return 'this item';
  return transaction.type === 'income'
    ? transaction.inc_source
    : transaction.categories;
};
