// src/pages/admin/ExportarPage.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Download, FileSpreadsheet, FileText, Users, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

export function ExportarPage() {
  const [loading, setLoading] = useState('')
  const [tipo, setTipo] = useState<'pacientes' | 'consultas' | 'financeiro'>('pacientes')
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  const exportar = async () => {
    setLoading(tipo)
    
    let dados: any[] = []
    let filename = ''
    
    switch (tipo) {
      case 'pacientes':
        const { data: pacientes } = await supabase
          .from('pacientes')
          .select('*')
          .order('nome')
        dados = pacientes || []
        filename = 'pacientes'
        break
        
      case 'consultas':
        let query = supabase
          .from('consultas')
          .select('*, paciente:pacientes(nome), medico:medicos(nome)')
          .order('data', { ascending: false })
        
        if (periodoInicio) {
          query = query.gte('data', periodoInicio)
        }
        if (periodoFim) {
          query = query.lte('data', periodoFim)
        }
        
        const { data: consultas } = await query
        dados = (consultas || []).map(c => ({
          data: c.data,
          hora: c.hora,
          paciente: c.paciente?.nome,
          medico: c.medico?.nome,
          tipo: c.tipo,
          valor: c.valor,
          status: c.status,
        }))
        filename = 'consultas'
        break
        
      case 'financeiro':
        let queryFin = supabase
          .from('consultas')
          .select('*, paciente:pacientes(nome)')
          .in('status', ['finalizada', 'pago'])
        
        if (periodoInicio) {
          queryFin = queryFin.gte('data', periodoInicio)
        }
        if (periodoFim) {
          queryFin = queryFin.lte('data', periodoFim)
        }
        
        const { data: financeiro } = await queryFin
        dados = (financeiro || []).map(f => ({
          data: f.data,
          paciente: f.paciente?.nome,
          valor: f.valor,
          tipo: f.tipo,
          status: f.status,
        }))
        filename = 'financeiro'
        break
    }
    
    // Converter para CSV
    if (dados.length > 0) {
      const headers = Object.keys(dados[0])
      const csv = [
        headers.join(','),
        ...dados.map(row => 
          headers.map(h => {
            const val = row[h]
            return typeof val === 'string' && val.includes(',') 
              ? `"${val}"` 
              : val ?? ''
          }).join(',')
        )
      ].join('\n')
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    }
    
    setLoading('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exportar Dados</h1>
        <p className="text-gray-600">Exportar dados para Excel/CSV</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Selecione o tipo de dados</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTipo('pacientes')}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                tipo === 'pacientes' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Pacientes</p>
            </button>
            <button
              onClick={() => setTipo('consultas')}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                tipo === 'consultas' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Consultas</p>
            </button>
            <button
              onClick={() => setTipo('financeiro')}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                tipo === 'financeiro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="font-medium">Financeiro</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {tipo !== 'pacientes' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Período</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Início</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Fim</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={exportar} disabled={!!loading} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        {loading ? 'Exportando...' : 'Baixar arquivo CSV'}
      </Button>
    </div>
  )
}