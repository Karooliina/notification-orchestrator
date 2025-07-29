export function getCurrentDayAndTime() {
  const currentDate = new Date();
  const currentDay = currentDate.getUTCDay();
  const currentTime =
    currentDate.getUTCHours().toString().padStart(2, '0') +
    ':' +
    currentDate.getUTCMinutes().toString().padStart(2, '0');
  return { currentDay, currentTime };
}
