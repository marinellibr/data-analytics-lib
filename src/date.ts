// Formats a Date as dd/MM/yyyy hh:mm AM/PM, the format used across the dashboard
export const formatDateTime = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours24 = date.getHours();
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours = String(hours24 % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes} ${period}`;
};
