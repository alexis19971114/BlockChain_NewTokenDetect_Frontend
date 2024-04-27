export const convertTimezone = (date) => {
  let deviation     = 54656000
  let serverDate    = Date.parse(date)
  let currentDate   = new Date(serverDate + deviation)

  const year        = currentDate.getFullYear();
  const month       = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day         = String(currentDate.getDate()).padStart(2, '0');
  const hours       = String(currentDate.getHours()).padStart(2, '0');
  const minutes     = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds     = String(currentDate.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}