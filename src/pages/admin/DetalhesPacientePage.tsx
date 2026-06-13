// src/pages/admin/DetalhesPacientePage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar,
  User, Trash2 
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import type { Paciente } from '../../types'

export function DetalhesPacientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) buscarDados()
  }, [id])

  const buscarDados = async () => {
    setLoading(true)
    
    const { data: pacienteData } = await supabase
      .from('pacientes')
      .select('*, convenios(nome_fantasia)')
      .eq('id', id)
      .single()
    
    if (pacienteData) setPaciente(pacienteData)

    const { data: consultasData } = await supabase
      .from('consultas')
      .select('*, medico:medicos(nome)')
      .eq('paciente_id', id)
      .order('data', { ascending: false })
      .limit(10)
    
    if (consultasData) setConsultas(consultasData)
    
    setLoading(false)
  }

  const excluirPaciente = async () => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return
    
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)
    
    if (!error) {
      navigate('/admin/pacientes')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  if (!paciente) {
    return <div className="p-8 text-center">Paciente não encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/pacientes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{paciente.nome}</h1>
            <p className="text-gray-600">Detalhes do paciente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={excluirPaciente}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Informações Pessoais</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{paciente.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CPF</p>
              <p className="font-medium">{paciente.cpf}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">RG</p>
              <p className="font-medium">{paciente.rg || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Nascimento</p>
              <p className="font-medium">
                {paciente.data_nascimento ? formatDate(paciente.data_nascimento) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sexo</p>
              <p className="font-medium capitalize">{paciente.sexo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Convênio</p>
              <p className="font-medium">
                {paciente.convenios?.nome_fantasia || 'Particular'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Contato</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{paciente.telefone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium">{paciente.whatsapp || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{paciente.email || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Endereço</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">
                {[paciente.endereco, paciente.cidade, paciente.estado]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <p className="text-gray-500">{paciente.cep}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Consultas */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Consultas ({consultas.length})</h2>
        </CardHeader>
        <CardContent className="p-0">
          {consultas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma consulta encontrada
            </div>
          ) : (
            <div className="divide-y">
              {consultas.map((consulta) => (
                <div key={consulta.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{formatDate(consulta.data)} às {consulta.hora}</p>
                      <p className="text-sm text-gray-500">{consulta.medico?.nome}</p>
                    </div>
                  </div>
                  <Badge className={
                    consulta.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                    consulta.status === 'agendada' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100'
                  }>
                    {consulta.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}