import type { Meeting } from './types'
const marker = /^\[JARVIS_PENDIENTE:([^\]]+)\]\n?/m
export const pendingMeeting = (notes = '') => marker.exec(notes)?.[1].split(',') ?? []
export const pendingLabels: Record<string, string> = {
  title: 'título',
  company: 'empresa',
  project: 'proyecto',
  date: 'fecha',
  time: 'hora',
  duration: 'duración',
  participants: 'participantes',
  location_type: 'modalidad',
  location: 'lugar',
}
export const visibleMeetingNotes = (notes = '') => notes.replace(marker, '')
export function meetingTime(m: Meeting, formatTime: (date: string) => string) {
  return (
    formatTime(m.starts_at) +
    (pendingMeeting(m.notes).includes('duration')
      ? ' · duración por definir'
      : ' – ' + formatTime(m.ends_at))
  )
}
export function completedCapture(
  notes: string,
  values: {
    duration: string
    attendees: string[]
    guests: string
    location_type: string
    location: string
  },
) {
  const original = pendingMeeting(notes)
  if (!original.length) return notes
  const pending = original.filter((field) =>
    field === 'duration'
      ? !Number(values.duration)
      : field === 'participants'
        ? !values.attendees.length && !values.guests.trim()
        : field === 'location_type'
          ? !values.location_type
          : field === 'location'
            ? !values.location.trim() || /^por definir$/i.test(values.location.trim())
            : false,
  )
  const body = visibleMeetingNotes(notes)
    .replace(/^Datos por completar:.*\n?/m, '')
    .replace(/^Duración provisoria:.*\n?/m, '')
    .replace(/^Modalidad pendiente:.*\n?/m, '')
  return (
    (pending.length
      ? `[JARVIS_PENDIENTE:${pending.join(',')}]\nDatos por completar: ${pending.map((k) => pendingLabels[k] ?? k).join(', ')}.\n`
      : '') + body
  )
}
