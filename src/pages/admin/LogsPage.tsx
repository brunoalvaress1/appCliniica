// src/pages/admin/LogsPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Search, User, Calendar, Activity, Clock, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

interface Log {
  id: string
  acao: string
  tabela: string
  registro_id: string
  usuario: string
  detalhes: string
  created_at: string
}

export function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarLogs()
  }, [])

  const buscarLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) setLogs(data)
    setLoading(false)
  }

  const getIcon = (tabela: string) => {
    switch (tabela) {
      case 'pacientes': return <User className="w-4 h-4" />
      case 'consultas': return <Calendar className="w-4 h-4" />
      case 'medicos': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCor = (acao: string) => {
    switch (acao) {
      case 'INSERT': return 'text-green-600'
      case 'UPDATE': return 'text-blue-600'
      case 'DELETE': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const logsFiltrados = logs.filter(l => 
    filtro === '' || 
    l.tabela.includes(filtro) || 
    l.acao.includes(filtro)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs / Auditoria</h1>
          <p className="text-gray-600">Histórico de alterações no sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar..."
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : logsFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum log encontrado</div>
          ) : (
            <div className="divide-y">
              {logsFiltrados.map((log) => (
                <div key={log.id} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getIcon(log.tabela)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getCor(log.acao)}`}>{log.acao}</span>
                      <span className="text-gray-500">em</span>
                      <span className="font-medium">{log.tabela}</span>
                    </div>
                    <p className="text-sm text-gray-500">{log.detalhes}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(log.created_at)}
                    </div>
                    <p>{log.usuario}</p>
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