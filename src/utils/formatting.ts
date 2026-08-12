export const formatMoney = (value: number): string => {
  return `$ ${new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
};

export const parseDateAsLocal = (date: string | Date): Date => {
  if (date instanceof Date) return date;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!dateOnlyMatch) return new Date(date);

  const [, year, month, day] = dateOnlyMatch;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const formatDate = (date: string | Date): string => {
  const parsedDate = parseDateAsLocal(date);

  return parsedDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
