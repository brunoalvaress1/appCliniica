// src/pages/admin/DashboardPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { 
  Users, Calendar, Clock, DollarSign, TrendingUp,
  ArrowUp, ArrowDown, ChevronRight, Activity,
  UserCheck, UserX, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils'
import { type Consulta, type Paciente } from '../../types'

interface DashboardStats {
  totalPacientes: number
  consultasHoje: number
  consultasAgendadas: number
  faturamentoMes: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    consultasHoje: 0,
    consultasAgendadas: 0,
    faturamentoMes: 0,
  })
  const [proximasConsultas, setProximasConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    
    const hoje = new Date().toISOString().split('T')[0]
    const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    
    // Buscar estatísticas
    const [pacientesRes, consultasHojeRes, consultasAgendadasRes, faturamentoRes] = await Promise.all([
      supabase.from('pacientes').select('id', { count: 'exact' }),
      supabase.from('consultas').select('*').eq('data', hoje),
      supabase.from('consultas').select('*').gte('data', hoje).eq('status', 'agendada'),
      supabase.from('consultas').select('valor').gte('data', primeiroDiaMes).lte('data', hoje),
    ])
    
    const totalFaturamento = faturamentoRes.data?.reduce((acc, c) => acc + (c.valor || 0), 0) || 0
    
    setStats({
      totalPacientes: pacientesRes.count || 0,
      consultasHoje: consultasHojeRes.data?.length || 0,
      consultasAgendadas: consultasAgendadasRes.data?.length || 0,
      faturamentoMes: totalFaturamento,
    })
    
    // Buscar próximas consultas
    const { data: consultas } = await supabase
      .from('consultas')
      .select(`
        *,
        paciente:pacientes(nome),
        medico:medicos(nome)
      `)
      .gte('data', hoje)
      .in('status', ['agendada', 'confirmada'])
      .order('data')
      .order('hora')
      .limit(5)
    
    if (consultas) setProximasConsultas(consultas)
    
    setLoading(false)
  }

  const statCards = [
    {
      label: 'Pacientes Total',
      value: stats.totalPacientes,
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Consultas Hoje',
      value: stats.consultasHoje,
      icon: Calendar,
      color: 'green',
      change: '+5%',
      trend: 'up',
    },
    {
      label: 'Agendadas',
      value: stats.consultasAgendadas,
      icon: Clock,
      color: 'yellow',
      change: '-2%',
      trend: 'down',
    },
    {
      label: 'Faturamento Mês',
      value: formatCurrency(stats.faturamentoMes),
      icon: DollarSign,
      color: 'purple',
      change: '+8%',
      trend: 'up',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da clínica</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div className={`p-2 lg:p-3 rounded-lg ${colorMap[stat.color]}`}>
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                {stat.trend === 'up' ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUp className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <ArrowDown className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3 lg:mt-4">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid de 2 colunas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximas Consultas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">Próximas Consultas</h2>
            <Link to="/admin/agenda" className="text-sm text-blue-600 hover:text-blue-700">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {proximasConsultas.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma consulta agendada</p>
              </div>
            ) : (
              <div className="divide-y">
                {proximasConsultas.map((consulta: any) => (
                  <div key={consulta.id} className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {consulta.paciente?.nome}
                      </p>
                      <p className="text-sm text-gray-500">
                        {consulta.medico?.nome} • {consulta.hora}
                      </p>
                    </div>
                    <Badge className={getStatusColor(consulta.status)}>
                      {consulta.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/pacientes/novo">
                <div className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Novo Paciente</p>
                  <p className="text-sm text-gray-600">Cadastrar paciente</p>
                </div>
              </Link>
              <Link to="/admin/consultas/nova">
                <div className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
                  <Calendar className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Nova Consulta</p>
                  <p className="text-sm text-gray-600">Agendar consulta</p>
                </div>
              </Link>
              <Link to="/admin/medicos/novo">
                <div className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer">
                  <Activity className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Novo Médico</p>
                  <p className="text-sm text-gray-600">Cadastrar médico</p>
                </div>
              </Link>
              <Link to="/admin/relatorios">
                <div className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer">
                  <TrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
                  <p className="font-medium text-gray-900">Relatórios</p>
                  <p className="text-sm text-gray-600">Ver relatórios</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}