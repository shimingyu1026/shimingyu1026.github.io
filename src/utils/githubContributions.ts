export const contributionEndpoint =
  'https://github-contributions-api.jogruber.de/v4/shimingyu1026?y=last'

export interface ContributionDay {
  date: string
  count: number
  level: number
}

export async function fetchContributions(): Promise<ContributionDay[]> {
  const response = await fetch(contributionEndpoint, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`GitHub contributions returned ${response.status}`)
  const data = await response.json()
  const days: unknown = data.contributions
  if (!Array.isArray(days) || days.length === 0 || days.length > 380) {
    throw new Error('Invalid contribution calendar')
  }
  if (
    days.some(
      (day) =>
        typeof day?.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        !Number.isFinite(Date.parse(day.date)) ||
        !Number.isInteger(day.count) ||
        day.count < 0 ||
        !Number.isInteger(day.level) ||
        day.level < 0 ||
        day.level > 4
    )
  )
    throw new Error('Invalid contribution day')
  const sorted = (days as ContributionDay[]).sort((a, b) => a.date.localeCompare(b.date))
  if (new Set(sorted.map((day) => day.date)).size !== sorted.length) {
    throw new Error('Duplicate contribution dates')
  }
  return sorted
}

const dayMilliseconds = 86400000
const dateLabel = (date: string) => date.replaceAll('-', '.')

export function createCalendar(days: ContributionDay[]) {
  const first = new Date(`${days[0].date}T00:00:00Z`)
  const start = first.getTime() - first.getUTCDay() * dayMilliseconds
  const months: { label: string; x: number }[] = []
  let previousMonth = ''
  const cells = days.map((day) => {
    const date = new Date(`${day.date}T00:00:00Z`)
    const week = Math.floor((date.getTime() - start) / (7 * dayMilliseconds))
    const month = day.date.slice(0, 7)
    // Label the first full week of each month so labels stay aligned with the grid.
    if (date.getUTCDay() === 0 && month !== previousMonth) {
      if (week > 0 || date.getUTCDate() <= 7) {
        months.push({ label: `${date.getUTCMonth() + 1}月`, x: 28 + week * 16 })
      }
      previousMonth = month
    }
    return {
      ...day,
      x: 28 + week * 16,
      y: 26 + date.getUTCDay() * 16,
      label: `${dateLabel(day.date)} · ${day.count} 次贡献`
    }
  })
  const last = days[days.length - 1].date
  return {
    cells,
    months,
    width: cells[cells.length - 1].x + 16,
    range: `${dateLabel(days[0].date)} — ${dateLabel(last)}`,
    summary: `GitHub 贡献日历：${dateLabel(days[0].date)} 至 ${dateLabel(last)}。`
  }
}
