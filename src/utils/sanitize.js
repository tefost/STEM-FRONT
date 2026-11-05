const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value, max = 2000) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL, '').replace(/\s+$/g, '').replace(/^\s+/g, '').slice(0, max);
}

export function cleanLine(value, max = 120) {
  return cleanText(value, max).replace(/\s+/g, ' ');
}

export function safeCsvCell(value) {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",;\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}
