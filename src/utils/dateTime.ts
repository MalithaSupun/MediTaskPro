export function isSameLocalDay(firstDateIso: string, secondDate: Date): boolean {
  const firstDate = new Date(firstDateIso);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function getGreetingByTime(date: Date): string {
  const currentHour = date.getHours();

  if (currentHour < 12) {
    return 'Good Morning';
  }

  if (currentHour < 17) {
    return 'Good Afternoon';
  }

  return 'Good Evening';
}

export function formatSyncTime(isoDate: string | null): string {
  if (!isoDate) {
    return 'Not synced yet';
  }

  return new Date(isoDate).toLocaleString();
}
