import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Calendar, Clock, User, Stethoscope, X, ChevronLeft, ChevronRight, Search, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Medico {
  id: string
  nome: string
  especialidade: string
}

export function AgendamentoPage() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(1)
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [pacienteId, setPacienteId] = useState('')
  const [medicoSelecionado, setMedicoSelecionado] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horaSelecionada, setHoraSelecionada] = useState('')
  const [tipoConsulta, setTipoConsulta] = useState('particular')
  const [loading, setLoading] = useState(false)
  const [consultasDisponiveis] = useState<string[]>(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'])
  const [buscaMedico, setBuscaMedico] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('paciente_id')
    if (!id) { navigate('/login'); return }
    setPacienteId(id)
    buscarMedicos()
  }, [])

  const buscarMedicos = async () => {
    const { data } = await supabase.from('medicos').select('*').order('nome')
    if (data) setMedicos(data)
  }

  const formatarData = () => {
    if (!dataSelecionada) return ''
    const d = new Date(dataSelecionada)
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const proximoDia = () => {
    const hoje = new Date()
    hoje.setDate(hoje.getDate() + 1)
    setDataSelecionada(hoje.toISOString().split('T')[0])
  }

  const diaAnterior = () => {
    const hoje = new Date()
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    if (new Date(dataSelecionada) > amanha) {
      const d = new Date(dataSelecionada)
      d.setDate(d.getDate() - 1)
      setDataSelecionada(d.toISOString().split('T')[0])
    }
  }

  const agendandoConsulta = async () => {
    if (!medicoSelecionado || !dataSelecionada || !horaSelecionada || !pacienteId) {
      alert('Preencha todos os campos!')
      return
    }
    setLoading(true)
    await supabase.from('consultas').insert({
      paciente_id: pacienteId,
      medico_id: medicoSelecionado,
      data: dataSelecionada,
      hora: horaSelecionada,
      tipo: tipoConsulta,
      valor: tipoConsulta === 'particular' ? 200 : 0,
      status: 'agendada'
    })
    setEtapa(5)
    setLoading(false)
  }

  const medicosFiltrados = medicos.filter(m => 
    m.nome?.toLowerCase().includes(buscaMedico.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(buscaMedico.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Agendamento</h1>
      </header>

      <main className="p-4 pb-20">
        {/* ETAPA 1: SELECIONAR MÉDICO */}
        {etapa === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold mb-4">1. Selecione o Médico</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar médico..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl"
                  value={buscaMedico}
                  onChange={(e) => setBuscaMedico(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {medicosFiltrados.map((m) => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      setMedicoSelecionado(m.id)
                      setEtapa(2)
                    }}
                    className="p-4 rounded-xl flex items-center gap-3 cursor-pointer bg-gray-50 active:bg-blue-100"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{m.nome}</p>
                      <p className="text-sm text-gray-500">{m.especialidade}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: SELECIONAR DATA */}
        {etapa === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold mb-4">2. Selecione a Data</h2>
              <div className="flex items-center justify-between mb-4">
                <button onClick={diaAnterior} className="p-2 bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="text-center flex-1">
                  <p className="font-bold capitalize">{formatarData() || 'Selecione uma data'}</p>
                </div>
                <button onClick={proximoDia} className="p-2 bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 rounded-xl mb-4"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEtapa(1)} className="flex-1">Voltar</Button>
                <Button 
                  onClick={() => dataSelecionada && setEtapa(3)} 
                  disabled={!dataSelecionada}
                  className="flex-1 bg-blue-500"
                >
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: SELECIONAR HORÁRIO */}
        {etapa === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold mb-4">3. Selecione o Horário</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {consultasDisponiveis.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHoraSelecionada(h)}
                    className={`p-3 rounded-lg text-center text-sm ${
                      horaSelecionada === h 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEtapa(2)} className="flex-1">Voltar</Button>
                <Button 
                  onClick={() => horaSelecionada && setEtapa(4)} 
                  disabled={!horaSelecionada}
                  className="flex-1 bg-blue-500"
                >
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: CONFIRMAR */}
        {etapa === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold mb-4">4. Confirmar Agendamento</h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Médico</p>
                    <p className="font-medium">{medicos.find(m => m.id === medicoSelecionado)?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">{formatarData()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-medium">{horaSelecionada}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <select 
                      value={tipoConsulta}
                      onChange={(e) => setTipoConsulta(e.target.value)}
                      className="font-medium bg-transparent"
                    >
                      <option value="particular">Particular - R$ 200</option>
                      <option value="convenio">Convênio</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEtapa(3)} className="flex-1">Voltar</Button>
                <Button 
                  onClick={agendandoConsulta} 
                  disabled={loading}
                  className="flex-1 bg-green-500"
                >
                  {loading ? 'Agendando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 5: SUCESSO */}
        {etapa === 5 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">Agendado com Sucesso!</h2>
                <p className="text-gray-500 mb-4">Sua consulta foi marcada para:</p>
                <div className="bg-gray-50 p-4 rounded-xl text-left mb-4">
                  <p><strong>Médico:</strong> {medicos.find(m => m.id === medicoSelecionado)?.nome}</p>
                  <p><strong>Data:</strong> {formatarData()}</p>
                  <p><strong>Horário:</strong> {horaSelecionada}</p>
                </div>
                <Button onClick={() => navigate('/')} className="w-full bg-blue-500">Voltar ao Início</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* BOTÃO VOLTAR ETAPAS */}
      {etapa > 1 && etapa < 5 && (
        <button 
          onClick={() => setEtapa(etapa - 1)} 
          className="fixed bottom-6 left-6 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-lg z-40"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
      )}
    </div>
  )
}