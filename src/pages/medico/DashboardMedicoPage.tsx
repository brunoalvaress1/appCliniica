// src/pages/medico/DashboardMedicoPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Calendar, Users, Clock, DollarSign, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { formatDate, formatCurrency } from '../../lib/utils'

export function DashboardMedicoPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    hoje: 0,
    semana: 0,
    mes: 0,
    ganhaMes: 0,
  })
  const [proximas, setProximas] = useState<any[]>([])

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    const hoje = new Date().toISOString().split('T')[0]
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    const inicioMes = new Date()
    inicioMes.setDate(1)

    const [hojeRes, semanaRes, mesRes, proximasRes] = await Promise.all([
      supabase.from('consultas').select('*').eq('data', hoje).eq('medico_id', user?.id),
      supabase.from('consultas').select('*').gte('data', inicioSemana.toISOString().split('T')[0]).eq('medico_id', user?.id),
      supabase.from('consultas').select('*').gte('data', inicioMes.toISOString().split('T')[0]).eq('medico_id', user?.id),
      supabase.from('consultas').select('*, paciente:pacientes(nome)').gte('data', hoje).eq('medico_id', user?.id).in('status', ['agendada', 'confirmada']).order('data').order('hora').limit(5),
    ])

    const valorMes = mesRes.data?.filter(c => c.status === 'finalizada').reduce((acc, c) => acc + (c.valor || 0), 0) || 0

    setStats({
      hoje: hojeRes.data?.length || 0,
      semana: semanaRes.data?.length || 0,
      mes: mesRes.data?.length || 0,
      ganhaMes: valorMes,
    })

    if (proximasRes.data) setProximas(proximasRes.data)
  }

  const cards = [
    { label: 'Hoje', value: stats.hoje, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Esta Semana', value: stats.semana, icon: Users, color: 'bg-green-500' },
    { label: 'Este Mês', value: stats.mes, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Ganho Mês', value: formatCurrency(stats.ganhaMes), icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Médico</h1>
        <p className="text-gray-600">Suas estatísticas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximas Consultas */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Próximas Consultas</h2>
          </div>
          {proximas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma consulta agendada</div>
          ) : (
            <div className="divide-y">
              {proximas.map((consulta) => (
                <div key={consulta.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{consulta.paciente?.nome}</p>
                      <p className="text-sm text-gray-500">{formatDate(consulta.data)} às {consulta.hora}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}