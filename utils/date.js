function pad2(num) {
  return String(num).padStart(2, '0')
}

function formatDateKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  return `${year}-${month}-${day}`
}

function getLocalDayKey(value) {
  if (!value) return ''
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return formatDateKey(parsed)
}

module.exports = { formatDateKey, getLocalDayKey }
