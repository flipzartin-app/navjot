export const formatViews = (n) => {
  if (!n) return '0 views';
  if (n < 1000) return `${n} view${n === 1 ? '' : 's'}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k views`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
};
