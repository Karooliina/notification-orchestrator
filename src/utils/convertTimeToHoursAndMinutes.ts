export function convertTimeToHoursAndMinutes(time?: string) {
  if (!time) return undefined;
  const hours = new Date(time).getUTCHours().toString().padStart(2, '0');
  const minutes = new Date(time).getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
