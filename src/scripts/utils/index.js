// src/scripts/utils/index.js
export function setupSkipToContent() {
  // kode yang sudah ada
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export function showFormattedDate(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', options).format(dateObject);
}