// src/pages/convenio/AgendaConvenioPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Calendar, Clock, Stethoscope,
  ChevronLeft, ChevronRight, MessageCircle, 
  Check, Plus, History, UserPlus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AgendaConvenioPage() {
  const navigate = useNavigate()
  const [convenioNome, setConvenioNome] = useState('')
  const [convenioValor, setConvenioValor] = useState(200)
  const [consultas, setConsultas] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [showCriar, setShowCriar] = useState(false)
  const [showHistorico, setShowHistorico] = useState(false)
  const [showCadastrar, setShowCadastrar] = useState(false)
  const [medicos, setMedicos] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  
  const [novaConsulta, setNovaConsulta] = useState({
    paciente_id: '',
    medico_id: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00'
  })

  const [novoPaciente, setNovoPaciente] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    whatsapp: '',
    cidade: ''
  })

  useEffect(() => {
    const nome = localStorage.getItem('convenio_nome')
    const tipo = localStorage.getItem('convenio_tipo')
    
    if (!nome) {
      navigate('/convenio/login')
      return
    }
    
    setConvenioNome(nome)
    
    if (tipo === 'particular') {
      setConvenioValor(200)
    } else {
      buscarValor(nome)
    }
    
    buscarMedicos()
    buscarPacientes()
  }, [])

  useEffect(() => {
    if (convenioNome) {
      buscarConsultas()
      buscarHistorico()
    }
  }, [dataSelecionada])

  const buscarValor = async (nome: string) => {
    const { data } = await supabase
      .from('convenios')
      .select('valor_consulta')
      .ilike('nome_fantasia', nome)
      .single()
    if (data) setConvenioValor(data.valor_consulta || 0)
  }

  const buscarMedicos = async () => {
    const { data } = await supabase.from('medicos').select('id, nome').order('nome')
    if (data) setMedicos(data)
  }

  const buscarPacientes = async () => {
    const { data } = await supabase.from('pacientes').select('id, nome, cpf').order('nome')
    if (data) setPacientes(data)
  }

  const buscarConsultas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('consultas')
      .select('*')
      .eq('data', dataSelecionada)
      .eq('tipo', conveniosNome)
      .order('hora')
    
    setConsultas(data || [])
    setLoading(false)
  }

  const buscarHistorico = async () => {
    const { data } = await supabase
      .from('consultas')
      .select('id, data, hora, valor')
      .eq('tipo', convenienteNome)
      .eq('status', 'finalizada')
      .order('data', { ascending: false })
      .limit(20)
    
    if (data) setHistorico(data)
  }

  const criarPaciente = async () => {
    if (!novoPaciente.nome || !novoPaciente.cpf) return

    const { data } = await supabase
      .from('pacientes')
      .insert({
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        telefone: novoPaciente.telefone || null,
        whatsapp: novoPaciente.whatsapp || null,
        cidade: novoPaciente.cidade || null
      })
      .select()
      .single()

    if (data) {
      setShowCadastrar(false)
      setNovoPaciente({ nome: '', cpf: '', telefone: '', whatsapp: '', cidade: '' })
      buscarPacientes()
      setNovaConsulta({ ...novaConsulta, patiente_id: data.id })
    }
  }

  const criarConsulta = async () => {
    if (!novaConsulta.paciente_id || !novaConsulta.medico_id) return

    await supabase.from('consultas').insert({
      paciente_id: novaConsulta.paciente_id,
      medico_id: novaConsulta.medico_id,
      data: novaConsulta.data,
      hora: novaConsulta.hora,
      tipo: convenienciaNome,
      valor: convientValor,
      status: 'agendada'
    })

    setShowCriar(false)
    setNovaConsulta({ 
      paciente_id: '', 
      medico_id: '', 
      data: format(new Date(), 'yyyy-MM-dd'), 
      hora: '09:00' 
    })
    
    buscarConsultas()
  }

  const atualizarStatus = async (id: string, status: string) => {
    await supabase.from('consultas').update({ status }).eq('id', id)
    buscarConsultas()
    buscarHistorico()
  }

  const navegarDia = (dias: number) => {
    const novaData = addDays(parseISO(dataSelecionada), dias)
    setDataSelecionada(format(novaData, 'yyyy-MM-dd'))
  }

  const formatarData = () => {
    try {
      return format(parseISO(dataSelecionada), "EEEE, dd 'de' MMMM", { locale: ptBR })
    } catch {
      return dataSelecionada
    }
  }

  const consultasAgendadas = consultas?.filter(c => c.status === 'agendada') || []

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{convenioNome}</h1>
                <p className="text-sm text-teal-100">Valor: R$ {convenioValor}</p>
              </div>
            </div>
            <button onClick={() => { localStorage.clear(); navigate('/convenio/login') }} className="bg-white/20 px-3 py-2 rounded-lg text-sm">
              Sair
            </button>
          </div>
        </div>

        <div className="bg-white px-4 py-3 flex gap-2">
          <Button onClick={() => setShowCriar(!showCriar)} className="flex-1 bg-green-600">
            <Plus className="w-4 h-4 mr-1" />Nova
          </Button>
          <Button onClick={() => setShowCadastrar(!showCadastrar)} variant="outline" className="flex-1">
            <UserPlus className="w-4 h-4 mr-1" />Cadastrar
          </Button>
          <Button onClick={() => setShowHistorico(!showHistorico)} variant="outline" className="flex-1">
            <History className="w-4 h-4 mr-1" />Historico
          </Button>
        </div>

        <div className="bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navegarDia(-1)} className="w-12 h-12 bg-gray-100 rounded-full">
              <ChevronLeft className="w-6 h-6 text-gray-600 mx-auto" />
            </button>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{formatarData()}</p>
              <p className="text-sm text-gray-500">{consultasAgendadas.length} agenda(s)</p>
            </div>
            <button onClick={() => navegarDia(1)} className="w-12 h-12 bg-gray-100 rounded-full">
              <ChevronRight className="w-6 h-6 text-gray-600 mx-auto" />
            </button>
          </div>
        </div>
      </header>

      {showCadastrar && (
        <Card className="m-4">
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg">Cadastrar Paciente</h3>
            <Input label="Nome *" placeholder="Nome" value={novoPaciente.nome} onChange={(e) => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
            <Input label="CPF *" placeholder="CPF" value={novoPaciente.cpf} onChange={(e) => setNovoPaciente({...novoPaciente, cpf: e.target.value})} />
            <Input label="Telefone" placeholder="Telefone" value={novoPaciente.telefone} onChange={(e) => setNovoPaciente({...novoPaciente, telefone: e.target.value})} />
            <Input label="WhatsApp" placeholder="WhatsApp" value={novoPaciente.whatsapp} onChange={(e) => setNovoPaciente({...novoPaciente, whatsapp: e.target.value})} />
            <Input label="Cidade" placeholder="Cidade" value={novoPaciente.cidade} onChange={(e) => setNovoPaciente({...novoPaciente, cidade: e.target.value})} />
            <Button onClick={criarPaciente} className="w-full bg-green-600">Cadastrar</Button>
          </CardContent>
        </Card>
      )}

      {showCriar && (
        <Card className="m-4">
          <CardContent className="space-y-4">
            <h3 className="font-bold text-lg">Nova Consulta</h3>
            <select className="w-full p-2.5 border rounded-lg" value={novaConsulta.paciente_id} onChange={(e) => setNovaConsulta({...novaConsulta, pacientes: e.target.value})}>
              <option value="">Selecione paciente</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome} - {p.cpf}</option>)}
            </select>
            <select className="w-full p-2.5 border rounded-lg" value={novaConsulta.medico_id} onChange={(e) => setNovaConsulta({...novaConsulta, profesionales: e.target.value})}>
              <option value="">Selecione médico</option>
              {medicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={novaConsulta.datos} onChange={(e) => setNovaConsulta({...novaConsulta, datos: e.target.value})} />
              <select className="p-2.5 border rounded-lg" value={novaConsulta.horas} onChange={(e) => setNovaConsulta({...novaConsulta, horas: e.target.value})}>
                {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
              <span>Valor:</span>
              <span className="font-bold text-green-600">R$ {convenioValor}</span>
            </div>
            <Button onClick={criarConsulta} className="w-full bg-green-600">Criar Consulta</Button>
          </CardContent>
        </Card>
      )}

      {showHistorico && (
        <Card className="m-4">
          <CardContent>
            <h3 className="font-bold text-lg mb-4">Histórico</h3>
            {historico?.length === 0 ? <p className="text-gray-500">Nenhuma</p> : (
              <div className="space-y-2">
                {historico?.map((h: any) => (
                  <div key={h.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">{h.data}</p>
                    <span className="text-green-600 font-bold">R$ {h.valor}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <main className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : !consultas || consultas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Nenhuma consulta</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultas?.map((c: any) => (
              <div key={c.id} className="rounded-lg shadow-sm bg-white">
                <div className="px-4 py-2 bg-gray-50 rounded-t-lg flex justify-between">
                  <span className="font-bold">{c.hora}</span>
                  <span className="text-xs text-blue-600">{c.status}</span>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm">ID: {c.paciente_id}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => window.open('https://wa.me/', '_blank')} className="flex-1 bg-green-500 text-white py-3 rounded-xl">WhatsApp</button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {c.status === 'agendada' && <button onClick={() => atualizarStatus(c.id, 'confirmada')} className="flex-1 bg-blue-500 text-white py-2 rounded">Confirmar</button>}
                    {c.status === 'confirmada' && <button onClick={() => atualizarStatus(c.id, 'em_atendimento')} className="flex-1 bg-purple-500 text-white py-2 rounded">Iniciar</button>}
                    {c.status === 'em_atendimento' && <button onClick={() => atualizarStatus(c.id, 'finalizada')} className="flex-1 bg-green-500 text-white py-2 rounded">Finalizar</button>}
                    {c.status === 'finalizada' && <div className="flex-1 bg-green-100 text-green-700 py-2 rounded text-center">Finalizado</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}