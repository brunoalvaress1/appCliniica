// src/pages/patient/PortalPacientePage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  Calendar, Clock, User, FileText, LogOut, 
  Home, Plus, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../lib/supabase'
import { formatDate, formatCurrency, getStatusColor } from '../../lib/utils'

export function PortalPacientePage() {
  const { user, logout } = useAuthStore()
  const [consultas, setConsultas] = useState<any[]>([])
  const [paciente, setPaciente] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    setLoading(true)
    
    // Buscar paciente logado
    const { data: pacienteData } = await supabase
      .from('pacientes')
      .select('*, convenios(nome_fantasia)')
      .eq('email', user?.email)
      .single()
    
    if (pacienteData) {
      setPaciente(pacienteData)
      
      // Buscar consultas
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('*, medico:medicos(nome, especialidade)')
        .eq('paciente_id', pacienteData.id)
        .order('data', { ascending: false })
        .limit(10)
      
      if (consultasData) setConsultas(consultasData)
    }
    
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  const proximas = consultas.filter(c => ['agendada', 'confirmada'].includes(c.status))
  const historico = consultas.filter(c => ['finalizada', 'cancelada'].includes(c.status))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">Portal Paciente</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Informações do Paciente */}
        {paciente && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{paciente.nome}</p>
                  <p className="text-gray-500">CPF: {paciente.cpf}</p>
                  <p className="text-gray-500">
                    Convênio: {paciente.convenios?.nome_fantasia || 'Particular'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agendar Nova Consulta */}
        <Link to="/agendar">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Nova Consulta</p>
                  <p className="text-sm text-gray-500">Agendar nova consulta</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Próximas Consultas ({proximas.length})</h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando...</div>
            ) : proximas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma consulta agendada</p>
              </div>
            ) : (
              <div className="divide-y">
                {proximas.map((consulta) => (
                  <div key={consulta.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{consulta.medico?.nome}</p>
                        <p className="text-sm text-gray-500">
                          {consulta.medico?.especialidade}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(consulta.data)} às {consulta.hora}</p>
                      <Badge className={getStatusColor(consulta.status)}>
                        {consulta.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Histórico ({historico.length})</h2>
          </CardHeader>
          <CardContent className="p-0">
            {historico.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhuma consulta no histórico
              </div>
            ) : (
              <div className="divide-y">
                {historico.map((consulta) => (
                  <div key={consulta.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{consulta.medico?.nome}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(consulta.data)}
                        </p>
                      </div>
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
      </div>
    </div>
  )
}