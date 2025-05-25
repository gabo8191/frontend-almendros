export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string, locale: string = 'es-CO'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // timeZone: 'America/Bogota', // Optional: specify timezone if needed
  }).format(date);
};

// You can add other formatting functions here as needed