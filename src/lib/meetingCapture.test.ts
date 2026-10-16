import { describe, expect, it } from 'vitest'
import {
  completedCapture,
  meetingTime,
  pendingMeeting,
  visibleMeetingNotes,
} from './meetingCapture'
import type { Meeting } from './types'
const notes =
  '[JARVIS_PENDIENTE:duration,participants,location_type,location]\nDatos por completar: duración, participantes, modalidad, lugar.\nDuración provisoria: 30 minutos.\nModalidad pendiente: no acordada.\nPedido original conservado.'
describe('reuniones guardadas para completar después', () => {
  it('no presenta el fin provisorio como una duración acordada', () => {
    const m = { notes, starts_at: '18:00', ends_at: '18:30' } as Meeting
    expect(meetingTime(m, (s) => s)).toBe('18:00 · duración por definir')
    expect(visibleMeetingNotes(notes)).not.toContain('JARVIS_PENDIENTE')
  })
  it('al completar conserva el pedido original y retira solo los pendientes resueltos', () => {
    const result = completedCapture(notes, {
      duration: '60',
      attendees: ['franco'],
      guests: '',
      location_type: 'presencial',
      location: '',
    })
    expect(pendingMeeting(result)).toEqual(['location'])
    expect(result).toContain('Pedido original conservado')
    expect(result).not.toContain('Duración provisoria')
  })
  it('al terminar no mantiene marcas de datos pendientes', () => {
    const result = completedCapture(notes, {
      duration: '60',
      attendees: ['franco'],
      guests: '',
      location_type: 'presencial',
      location: 'Oficina',
    })
    expect(pendingMeeting(result)).toEqual([])
    expect(result).toBe('Pedido original conservado.')
  })
})
