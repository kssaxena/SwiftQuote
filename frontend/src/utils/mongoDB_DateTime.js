// Convert MongoDB date → DD/MM/YY
function formatDate(mongoDate) {
  const date = new Date(mongoDate);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

// Convert MongoDB date → 24-hour time
function formatTime(mongoDate) {
  const date = new Date(mongoDate);
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

// Returns both
function formatDateTime(mongoDate) {
  const date = formatDate(mongoDate);
  const time = formatTime(mongoDate);
  return {
    date,
    time,
    dateTimeString: `${date} ${time}`,
  };
}

// ⭐ For direct UI usage (date + time together)
export function formatDateTimeString(mongoDate) {
  return formatDateTime(mongoDate).dateTimeString;
}

// ⭐ Only date
export function formatDateString(mongoDate) {
  return formatDate(mongoDate);
}

// ⭐ Only time
export function formatTimeString(mongoDate) {
  return formatTime(mongoDate);
}
