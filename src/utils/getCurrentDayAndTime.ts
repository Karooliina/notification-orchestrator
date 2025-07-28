export function getCurrentDayAndTime() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentTime =
    currentDate.getHours().toString().padStart(2, '0') + ':' + currentDate.getMinutes().toString().padStart(2, '0');
  return { currentDay, currentTime };
}
