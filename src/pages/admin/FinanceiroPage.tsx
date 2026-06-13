// src/pages/admin/FinanceiroPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  CreditCard, Wallet, ArrowUp, ArrowDown, User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/utils'

export function FinanceiroPage() {
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes')
  const [receitas, setReceitas] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    particulares: 0,
    convenios: 0,
    despesas: 0,
    lucro: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarDados()
  }, [periodo])

  const buscarDados = async () => {
    setLoading(true)

    const hoje = new Date()
    let dataInicio: Date
    
    switch (periodo) {
      case 'dia':
        dataInicio = hoje
        break
      case 'semana':
        dataInicio = new Date(hoje.setDate(hoje.getDate() - 7))
        break
      case 'ano':
        dataInicio = new Date(hoje.getFullYear(), 0, 1)
        break
      default:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    }

    const dataStr = dataInicio.toISOString().split('T')[0]
    const hojeStr = new Date().toISOString().split('T')[0]

    const { data: consultasData } = await supabase
      .from('consultas')
      .select('*, pacientes(nome), medico:medicos(nome)')
      .gte('data', dataStr)
      .lte('data', hojeStr)
      .in('status', ['finalizada', 'pago'])

    if (consultasData) {
      const particular = consultasData
        .filter(c => c.tipo === 'particular')
        .reduce((acc, c) => acc + (c.valor || 0), 0)
      
      const convenio = consultasData
        .filter(c => c.tipo === 'convenio')
        .reduce((acc, c) => acc + (c.valor || 0), 0)

      setStats({
        total: particular + convenio,
        particulares: particular,
        convenios: convenio,
        despesas: 0,
        lucro: particular + convenios,
      })
      
      setReceitas(consultasData)
    }

    setLoading(false)
  }

  const statCards = [
    {
      label: 'Total Recebido',
      value: formatCurrency(stats.total),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      label: 'Particulares',
      value: formatCurrency(stats.particulares),
      icon: User,
      color: 'text-blue-600',
    },
    {
      label: 'Convênios',
      value: formatCurrency(stats.convenios),
      icon: CreditCard,
      color: 'text-purple-600',
    },
    {
      label: 'Lucro',
      value: formatCurrency(stats.lucro),
      icon: TrendingUp,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle financeiro</p>
        </div>
        <div className="flex gap-2">
          {(['dia', 'semana', 'mes', 'ano'] as const).map((p) => (
            <Button
              key={p}
              variant={periodo === p ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPeriodo(p)}
            >
              {p === 'dia' ? 'Hoje' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
            </Button>
          ))}
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recebimentos ({receitas.length})</h2>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : receitas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma recebimento neste período
            </div>
          ) : (
            <div className="divide-y">
              {receitas.map((consulta) => (
                <div key={consulta.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{consulta.pacientes?.nome}</p>
                      <p className="text-sm text-gray-500">
                        {consulta.medico?.nome} • {formatDate(consulta.data)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(consulta.valor)}
                    </p>
                    <Badge variant="success">{consulta.tipo}</Badge>
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