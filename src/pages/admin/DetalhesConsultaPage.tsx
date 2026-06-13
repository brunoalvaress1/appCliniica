// src/pages/admin/DetalhesConsultaPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  ArrowLeft, Calendar, Clock, User, Stethoscope, 
  DollarSign, FileText, CheckCircle, XCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatCurrency, getStatusColor } from '../../lib/utils'

export function DetalhesConsultaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [consulta, setConsulta] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) buscarConsulta()
  }, [id])

  const buscarConsulta = async () => {
    const { data } = await supabase
      .from('consultas')
      .select(`
        *,
        paciente:pacientes(nome, cpf, telefone, email),
        medico:medicos(nome, especialidade, crm)
      `)
      .eq('id', id)
      .single()
    
    if (data) setConsulta(data)
    setLoading(false)
  }

  const atualizarStatus = async (novoStatus: string) => {
    await supabase
      .from('consultas')
      .update({ status: novoStatus })
      .eq('id', id)
    
    buscarConsulta()
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (!consulta) return <div className="p-8 text-center">Consulta não encontrada</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/agenda')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes da Consulta</h1>
            <p className="text-gray-600">#{id?.slice(0, 8)}</p>
          </div>
        </div>
        <Badge className={getStatusColor(consulta.status)}>
          {consulta.status}
        </Badge>
      </div>

      {/* Dados Principais */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Informações</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-semibold">{formatDate(consulta.data)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Horário</p>
                <p className="font-semibold">{consulta.hora}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-semibold">{consulta.paciente?.nome}</p>
                <p className="text-sm text-gray-500">{consulta.paciente?.cpf}</p>
              </div>
            </div>
           // src/pages/admin/DetalhesConsultaPage.tsx (continuação)
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Médico</p>
                <p className="font-semibold">{consulta.medico?.nome}</p>
                <p className="text-sm text-gray-500">{consulta.medico?.especialidade}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagamento */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pagamento</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-2xl">{formatCurrency(consulta.valor)}</p>
              <p className="text-sm text-gray-500 capitalize">{consulta.tipo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      {consulta.status === 'agendada' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ações</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => atualizarStatus('confirmada')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
              <Button variant="outline" onClick={() => atualizarStatus('cancelada')}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button variant="secondary" onClick={() => atualizarStatus('em_atendimento')}>
                <FileText className="w-4 h-4 mr-2" />
                Iniciar Atendimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {consulta.status === 'confirmada' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ações</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => atualizarStatus('em_atendimento')}>
                <FileText className="w-4 h-4 mr-2" />
                Iniciar Atendimento
              </Button>
              <Button variant="outline" onClick={() => atualizarStatus('cancelada')}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {consulta.status === 'em_atendimento' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ações</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => atualizarStatus('finalizada')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}