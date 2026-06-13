// src/pages/admin/RelatoriosPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  Users, Calendar, DollarSign, TrendingUp, 
  Activity, BarChart3, PieChart
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

export function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalConsultas: 0,
    consultasMes: 0,
    faturamentoMes: 0,
    mediaDiaria: 0,
    topMedicos: [] as any[],
    topEspecialidades: [] as any[],
  })

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    setLoading(true)

    const hoje = new Date()
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const dataMes = primeiroDiaMes.toISOString().split('T')[0]

    // Buscar estatísticas
    const [pacientesRes, consultasRes, consultasMesRes, financeiroRes] = await Promise.all([
      supabase.from('pacientes').select('id', { count: 'exact' }),
      supabase.from('consultas').select('id', { count: 'exact' }),
      supabase.from('consultas').select('id').gte('data', dataMes),
      supabase.from('consultas').select('valor, tipo').gte('data', dataMes).in('status', ['finalizada', 'pago']),
    ])

    const faturamento = financeiroRes.data?.reduce((acc, c) => acc + (c.valor || 0), 0) || 0
    const consultasMes = consultasMesRes.data?.length || 0
    const mediaDiaria = consultasMes / Math.max(hoje.getDate(), 1)

    // Buscar médicos mais ativos
    const { data: medicoData } = await supabase
      .from('consultas')
      .select('medico:medicos(nome, especialidade)')
      .gte('data', dataMes)
    
    const medicoAgrupado: Record<string, number> = {}
    medicoData?.forEach((c: any) => {
      const nome = c.medico?.nome || 'Desconhecido'
      medicoAgrupado[nome] = (medicoAgrupado[nome] || 0) + 1
    })
    
    const topMedicos = Object.entries(medicoAgrupado)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, count]) => ({ nome, count }))

    setStats({
      totalPacientes: pacientesRes.count || 0,
      totalConsultas: consultasRes.count || 0,
      consultasMes,
      faturamentoMes: faturamento,
      mediaDiaria: Math.round(mediaDiaria),
      topMedicos,
      topEspecialidades: [],
    })

    setLoading(false)
  }

  const statCards = [
    {
      label: 'Total Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Total Consultas',
      value: stats.totalConsultas,
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      label: 'Consultas no Mês',
      value: stats.consultasMes,
      icon: Activity,
      color: 'text-purple-600',
    },
    {
      label: 'Faturamento Mês',
      value: formatCurrency(stats.faturamentoMes),
      icon: DollarSign,
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Estatísticas da clínica</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos-simulação */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Médicos */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Médicos mais ativos no mês
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando...</div>
            ) : stats.topMedicos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Sem dados</div>
            ) : (
              <div className="space-y-4">
                {stats.topMedicos.map((medico, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{medico.nome}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(medico.count / stats.topMedicos[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-bold">{medico.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Média Diária */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Média Diária
            </h2>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-5xl font-bold text-blue-600">{stats.mediaDiaria}</p>
            <p className="text-gray-500 mt-2">consultas por dia</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Meta recomendada</p>
              <p className="font-semibold">15-20 consultas/dia</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}