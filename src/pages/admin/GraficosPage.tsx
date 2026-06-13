// src/pages/admin/GraficosPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'

export function GraficosPage() {
  const [dados, setDados] = useState({
    consultasPorMes: [] as any[],
    consultasPorDia: [] as any[],
    topPacientes: [] as any[],
    receitaPorMes: [] as any[],
  })

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    // Consultas por mês (últimos 6 meses)
    const seisMeses_Atras = new Date()
    seisMeses_Atras.setMonth(seisMeses_Atras.getMonth() - 6)
    
    const { data: consultas } = await supabase
      .from('consultas')
      .select('data, valor')
      .gte('data', seisMeses_Atras.toISOString().split('T')[0])
      .in('status', ['finalizada', 'pago'])

    // Agrupar por mês
    const porMes: Record<string, number> = {}
    const porDia: Record<string, number> = {}
    
    consultas?.forEach((c) => {
      const mes = c.data.substring(0, 7) // YYYY-MM
      porMes[mes] = (porMes[mes] || 0) + 1
      porDia[c.data] = (porDia[c.data] || 0) + 1
    })

    setDados({
      consultasPorMes: Object.entries(porMes).map(([mes, total]) => ({ mes, total })),
      consultasPorDia: Object.entries(porDia).map(([dia, total]) => ({ dia, total })).slice(-7),
      topPacientes: [],
      receitaPorMes: Object.entries(porMes).map(([mes, total]) => ({ mes, total: total * 200 })),
    })
  }

  const maximo = Math.max(...dados.consultasPorDia.map((d) => d.total), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
        <p className="text-gray-600">Visualizações e tendências</p>
      </div>

      {/* Consultas por Dia */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Últimos 7 Dias</h2>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-end gap-2">
            {dados.consultasPorDia.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(d.total / maximo) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.dia?.substring(8)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{dados.consultasPorDia.reduce((acc, d) => acc + d.total, 0)}</p>
            <p className="text-sm text-gray-500">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{dados.consultasPorDia[6]?.total || 0}</p>
            <p className="text-sm text-gray-500">Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{dados.topPacientes.length}</p>
            <p className="text-sm text-gray-500">Pacientes ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(12000)}</p>
            <p className="text-sm text-gray-500">Estimado mês</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}