export function formatDate(
  dateString: string | undefined | null,
  locale: string = 'fr-FR'
): string {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

