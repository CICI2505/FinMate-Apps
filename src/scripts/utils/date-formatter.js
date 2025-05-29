// src/scripts/utils/date-formatter.js
export function showFormattedDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  // Menerima input date berupa string atau objek Date
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('id-ID', options).format(dateObject);
}