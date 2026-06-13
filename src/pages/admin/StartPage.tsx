// src/pages/admin/StartPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  Users, Calendar, User, ClipboardList, 
  CreditCard, BarChart3, Building2, Settings
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function StartPage() {
  const [stats, setStats] = useState({
    pacientes: 0,
    medicos: 0,
    consultasHoje: 0,
    consultasAgendadas: 0,
  })

  useEffect(() => {
    buscarStats()
  }, [])

  const buscarStats = async () => {
    const hoje = new Date().toISOString().split('T')[0]
    
    const [pacientes, medicos, consultasHoje, consultasAgendadas] = await Promise.all([
      supabase.from('pacientes').select('id', { count: 'exact' }),
      supabase.from('medicos').select('id', { count: 'exact' }),
      supabase.from('consultas').select('id').eq('data', hoje),
      supabase.from('consultas').select('id').eq('data', hoje).in('status', ['agendada', 'confirmada']),
    ])
    
    setStats({
      pacientes: pacientes.count || 0,
      medicos: medicos.count || 0,
      consultasHoje: consultasHoje.data?.length || 0,
      consultasAgendadas: consultasAgendadas.data?.length || 0,
    })
  }

  const cards = [
    { icon: Users, label: 'Pacientes', value: stats.pacientes, path: '/admin/pacientes', color: 'bg-blue-500' },
    { icon: User, label: 'Médicos', value: stats.medicos, path: '/admin/medicos', color: 'bg-pink-500' },
    { icon: Calendar, label: 'Hoje', value: stats.consultasHoje, path: '/admin/agenda', color: 'bg-green-500' },
    { icon: ClipboardList, label: 'Agendadas', value: stats.consultasAgendadas, path: '/admin/agenda', color: 'bg-purple-500' },
  ]

  const menuItems = [
    { icon: Users, label: 'Pacientes', path: '/admin/pacientes' },
    { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
    { icon: User, label: 'Médicos', path: '/admin/medicos' },
    { icon: ClipboardList, label: 'Consultas', path: '/admin/consultas/nova' },
    { icon: Building2, label: 'Convênios', path: '/admin/convenios' },
    { icon: CreditCard, label: 'Financeiro', path: '/admin/financeiro' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/admin/config' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da clínica</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.path} to={card.path}>
            <Card className="hover:border-blue-300 transition-colors">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="hover:border-blue-300 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}