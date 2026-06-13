// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(':')
  return `${hours}h${minutes}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function generateTimeSlots(inicio: string, fim: string, intervalo: number): string[] {
  const slots: string[] = []
  let [hora, minuto] = inicio.split(':').map(Number)
  const [horaFim, minutoFim] = fim.split(':').map(Number)
  
  while (hora < horaFim || (hora === horaFim && minuto < minutoFim)) {
    slots.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`)
    minuto += intervalo
    if (minuto >= 60) {
      hora += Math.floor(minuto / 60)
      minuto = minuto % 60
    }
  }
  
  return slots
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    agendada: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    aguardando: 'bg-orange-100 text-orange-800',
    em_atendimento: 'bg-blue-100 text-blue-800',
    finalizada: 'bg-gray-100 text-gray-800',
    cancelada: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}