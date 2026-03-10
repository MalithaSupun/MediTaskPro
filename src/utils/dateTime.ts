export function isSameLocalDay(firstDateIso: string, secondDate: Date): boolean {
  const firstDate = new Date(firstDateIso);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
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
