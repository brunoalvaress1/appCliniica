import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ChevronLeft, ChevronRight, User, Plus, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function AgendaConvenioPage() {
  const navigate = useNavigate()
  const medicoId = localStorage.getItem('medico_id') || ''
  const nome = localStorage.getItem('medico_nome') || ''

  if (!medicoId) navigate('/medico/login')

  const [data, setData] = useState(new Date())

  const formatar = () => data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const proximo = () => { const d = new Date(data); d.setDate(d.getDate() + 1); setData(d) }
  const anterior = () => { const d = new Date(data); d.setDate(d.getDate() - 1); setData(d) }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-green-600 text-white p-4">
        <h1 className="text-xl font-bold">Dr. {nome}</h1>
        <p className="text-sm">Área Convênio</p>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={anterior} className="p-2 bg-gray-100 rounded-full"><ChevronLeft /></button>
          <p className="font-bold">{formatar()}</p>
          <button onClick={proximo} className="p-2 bg-gray-100 rounded-full"><ChevronRight /></button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>Em construção</p>
        </div>
      </div>
    </div>
  )
}