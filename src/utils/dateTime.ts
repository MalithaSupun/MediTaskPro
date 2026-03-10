export function isSameLocalDay(firstDateIso: string, secondDate: Date): boolean {
  const firstDate = new Date(firstDateIso);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isDateInputForLocalDay(dateInput: string, date: Date): boolean {
  return dateInput === toLocalDateInputValue(date);
}

export function formatDateInput(dateInput: string): string {
  const normalized = dateInput.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsedDate = new Date(`${normalized}T00:00:00`);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }

    return normalized;
  }

  const parsedDate = new Date(normalized);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString();
  }

  return normalized;
}

export function getGreetingByTime(date: Date): 'morning' | 'afternoon' | 'evening' {
  const currentHour = date.getHours();

  if (currentHour < 12) {
    return 'morning';
  }

  if (currentHour < 17) {
    return 'afternoon';
  }

  return 'evening';
}

export function formatSyncTime(isoDate: string | null, emptyLabel = 'Not synced yet'): string {
  if (!isoDate) {
    return emptyLabel;
  }

  return new Date(isoDate).toLocaleString();
}
