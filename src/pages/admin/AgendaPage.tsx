// src/pages/admin/AgendaPage.tsx
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { 
  Calendar, ChevronLeft, ChevronRight, Clock,
  User, Stethoscope, Phone, X, DollarSign
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getStatusColor, formatTime } from '../../lib/utils'
import { generateTimeSlots } from '../../lib/utils'
import type { Medico, Consulta } from '../../types'

export function AgendaPage() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [medicoSelecionado, setMedicoSelecionado] = useState<string | null>(null)
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [consultaSelecionada, setConsultaSelecionada] = useState<any>(null)
  
  const horarios = generateTimeSlots('08:00', '18:00', 30)
  const consultaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    buscarDados()
  }, [dataSelecionada, medicoSelecionado])

  // Navegar com setas do teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!consultaSelecionada) return
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        navigateConsulta(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        navigateConsulta(-1)
      } else if (e.key === 'Escape') {
        setConsultaSelecionada(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [consultaSelecionada, consultas])

  const navigateConsulta = (direction: number) => {
    if (consultas.length === 0) return
    
    const currentIndex = consultas.findIndex(c => c.id === consultaSelecionada?.id)
    let newIndex = currentIndex + direction
    
    if (newIndex < 0) newIndex = consultas.length - 1
    if (newIndex >= consultas.length) newIndex = 0
    
    setConsultaSelecionada(consultas[newIndex])
    
    // Scroll para o elemento
    setTimeout(() => {
      const element = document.getElementById(`consulta-${consultas[newIndex].id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const formatarDataBR = (data: Date) => {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  const normalizarHora = (hora: string) => {
    if (hora && hora.length > 5) {
      return hora.substring(0, 5)
    }
    return hora
  }

  const buscarDados = async () => {
    setLoading(true)
    setConsultaSelecionada(null)
    
    const { data: medicosData } = await supabase
      .from('medicos')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (medicosData) setMedicos(medicosData)
    
    const data = formatarDataBR(dataSelecionada)
    
    let query = supabase
      .from('consultas')
      .select(`
        *,
        paciente:pacientes(nome, cpf, telefone, whatsapp),
        medico:medicos(nome)
      `)
      .eq('data', data)
    
    if (medicoSelecionado) {
      query = query.eq('medico_id', medicoSelecionado)
    }
    
    const { data: consultasData } = await query.order('hora')
    
    if (consultasData) {
      const consultasNormalizadas = consultasData.map(c => ({
        ...c,
        hora: normalizarHora(c.hora)
      }))
      setConsultas(consultasNormalizadas)
    } else {
      setConsultas([])
    }
    
    setLoading(false)
  }

  const getConsultasByHorario = (hora: string) => {
    return consultas.filter(c => normalizarHora(c.hora) === hora)
  }

  const isHoje = () => {
    const hoje = new Date()
    return dataSelecionada.toDateString() === hoje.toDateString()
  }

  const proximoDia = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() + 1)
    setDataSelecionada(novaData)
  }

  const diaAnterior = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() - 1)
    setDataSelecionada(novaData)
  }

  const irParaHoje = () => {
    setDataSelecionada(new Date())
  }

  const formatarTelefone = (tel: string) => {
    if (!tel) return '-'
    const nums = tel.replace(/\D/g, '')
    if (nums.length >= 10) {
      return `(${nums.slice(2, 4)}) ${nums.slice(4, 9)}-${nums.slice(9)}`
    }
    return tel
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">
            {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={irParaHoje}>
            Hoje
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!medicoSelecionado ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMedicoSelecionado(null)}
            >
              Todos
            </Button>
            {medicos.map((medico) => (
              <Button
                key={medico.id}
                variant={medicoSelecionado === medico.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMedicoSelecionado(medico.id)}
              >
                {medico.nome.split(' ')[1] || medico.nome}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={diaAnterior}>
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </Button>
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => {
            const data = new Date()
            data.setDate(data.getDate() - 3 + i)
            const isSelected = data.toDateString() === dataSelecionada.toDateString()
            const isToday = data.toDateString() === new Date().toDateString()
            
            return (
              <button
                key={i}
                onClick={() => setDataSelecionada(new Date(data))}
                className={`p-2 rounded-lg text-center ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="text-xs">{data.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                <p className="text-lg font-bold">{data.getDate()}</p>
              </button>
            )
          })}
        </div>
        <Button variant="ghost" onClick={proximoDia}>
          Próximo
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isHoje() ? 'Hoje' : dataSelecionada.toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
          </h2>
          <span className="text-sm text-gray-500">{consultas.length} consultas</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : consultas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma consulta neste dia</div>
          ) : (
            <div className="divide-y">
              {horarios.map((hora) => {
                const consultasHora = getConsultasByHorario(hora)
                
                return (
                  <div key={hora} className="flex">
                    <div className="w-20 p-4 border-r bg-gray-50 flex-shrink-0">
                      <p className="font-medium text-gray-900">{hora}</p>
                    </div>
                    
                    <div className="flex-1 p-2 min-h-[80px]">
                      {consultasHora.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          -
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {consultasHora.map((consulta) => (
                            <div
                              key={consulta.id}
                              id={`consulta-${consulta.id}`}
                              onClick={() => setConsultaSelecionada(consulta)}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                consultaSelecionada?.id === consulta.id
                                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                                  : 'bg-white border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {consulta.paciente?.nome || 'Paciente'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {consulta.medico?.nome || 'Médico'}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(consulta.status)}>
                                  {consulta.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Detalhes da Consulta */}
      {consultaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalhes da Consulta</h2>
                <p className="text-sm text-gray-500">{consultaSelecionada.data}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setConsultaSelecionada(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paciente */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-lg">{consultaSelecionada.paciente?.nome}</p>
                  <p className="text-sm text-gray-500">CPF: {consultaSelecionada.paciente?.cpf || '-'}</p>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{consultaSelecionada.hora}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                  <span>{consultaSelecionada.medico?.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{formatarTelefone(consultaSelecionada.paciente?.telefone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-green-600">R$ {consultaSelecionada.valor}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(consultaSelecionada.status)}>
                    {consultaSelecionada.status}
                  </Badge>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="text-sm text-gray-500">Tipo</label>
                <p className="font-medium">{consultaSelecionada.tipo || 'Particular'}</p>
              </div>

              {/* Navegação */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigateConsulta(-1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigateConsulta(1)}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Use as setas do teclado para navegar
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}