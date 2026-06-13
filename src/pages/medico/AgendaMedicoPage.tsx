import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Stethoscope, Phone, X, DollarSign, Check, Plus, FileText, Activity, CheckCircle, XCircle, Bell, LogOut, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Paciente { id: string; nome: string; cpf: string; telefone: string }
interface Consulta { id: string; data: string; hora: string; status: string; valor: number; tipo: string; paciente_id: string; medico_id: string; paciente: Paciente }

export function AgendaMedicoPage() {
  const navigate = useNavigate()
  const [medicoId, setMedicoId] = useState('')
  const [medicoNome, setMedicoNome] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('agenda')
  const [pacientes, setPacientes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [novaConsulta, setNovaConsulta] = useState({ paciente_id: '', data: new Date().toISOString().split('T')[0], hora: '09:00', tipo: 'particular', valor: 200 })
  const [prontuario, setProntuario] = useState({ historico: '', exame: '', diagnostico: '', prescricao: '', retorno: '' })

  useEffect(() => {
    const id = localStorage.getItem('medico_id')
    const nome = localStorage.getItem('medico_nome')
    if (!id || !nome) { navigate('/medico/login'); return }
    setMedicoId(id)
    setMedicoNome(nome)
  }, [])

  useEffect(() => { if (medicoId) { buscarConsultas(); buscarPacientes() } }, [dataSelecionada, medicoId])

  const formatarDataBR = (data: Date) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`

  const buscarConsultas = async () => {
    setLoading(true)
    setConsultaSelecionada(null)
    const { data: consultasData } = await supabase.from('consultas').select('*, paciente:pacientes(nome, cpf, telefone)').eq('data', formatarDataBR(dataSelecionada)).eq('medico_id', medicoId).order('hora')
    if (consultasData) setConsultas(consultasData.map(c => ({ ...c, hora: c.hora?.substring(0, 5) })))
    else setConsultas([])
    setLoading(false)
  }

  const buscarPacientes = async () => { const { data } = await supabase.from('pacientes').select('*').order('nome'); if (data) setPacientes(data) }
  const proximoDia = () => { const d = new Date(dataSelecionada); d.setDate(d.getDate() + 1); setDataSelecionada(d) }
  const diaAnterior = () => { const d = new Date(dataSelecionada); d.setDate(d.getDate() - 1); setDataSelecionada(d) }
  const irParaHoje = () => setDataSelecionada(new Date())
  const formatarData = () => dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatarTelefone = (tel: string) => { if (!tel) return '-'; const n = tel.replace(/\D/g, ''); return n.length >= 10 ? `(${n.slice(2, 4)}) ${n.slice(4, 9)}-${n.slice(9)}` : tel }

  const criarConsulta = async () => {
    if (!novaConsulta.paciente_id) return
    await supabase.from('consultas').insert({ paciente_id: novaConsulta.paciente_id, medico_id: medicoId, data: novaConsulta.data, hora: novaConsulta.hora, tipo: novaConsulta.tipo, valor: novaConsulta.valor, status: 'agendada' })
    setShowModal(null)
    setNovaConsulta({ paciente_id: '', data: new Date().toISOString().split('T')[0], hora: '09:00', tipo: 'particular', valor: 200 })
    buscarConsultas()
  }

  const atualizarStatus = async (id: string, status: string) => { await supabase.from('consultas').update({ status }).eq('id', id); buscarConsultas(); setShowModal(null) }
  const salvarProntuario = async () => { if (!consultaSelecionada) return; await supabase.from('consultas').update({ historico: prontuario.historico, exame: prontuario.exame, diagnostico: prontuario.diagnostico, prescricao: prontuario.prescricao, retorno: prontuario.retorno, status: 'finalizada' }).eq('id', consultaSelecionada.id); setShowModal(null); buscarConsultas() }
  const getStatusBadge = (status: string) => { const m: any = { agendada: 'bg-blue-100 text-blue-700', confirmada: 'bg-yellow-100 text-yellow-700', em_atendimento: 'bg-purple-100 text-purple-700', finalizada: 'bg-green-100 text-green-700', cancelada: 'bg-red-100 text-red-700' }; return m[status] || 'bg-gray-100 text-gray-700' }

  const consultasAgendadas = consultas.filter(c => c.status === 'agendada' || c.status === 'confirmada')
  const consultasFinalizadas = consultas.filter(c => c.status === 'finalizada')
  const consultasHoje = consultas.filter(c => c.status === 'em_atendimento')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Stethoscope className="w-7 h-7" /></div>
              <div><h1 className="text-xl font-bold">Dr. {medicoNome}</h1><p className="text-sm text-blue-100">Clínica Musumeci</p></div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/20 p-2 rounded-lg"><Bell className="w-5 h-5" /></button>
              <button onClick={() => { localStorage.clear(); navigate('/medico/login') }} className="bg-white/20 px-3 py-2 rounded-lg text-sm"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        <div className="bg-white px-4 pb-2">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab('agenda')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'agenda' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Agenda</button>
            <button onClick={() => setActiveTab('pacientes')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'pacientes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Pacientes</button>
            <button onClick={() => setActiveTab('relatorios')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'relatorios' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Relatórios</button>
          </div>
        </div>
        <div className="bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={diaAnterior} className="p-2 bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <div className="text-center flex-1">
              <p className="font-bold text-gray-800 capitalize">{formatarData()}</p>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-blue-600">{consultasAgendadas.length} agenda</span>
                <span className="text-purple-600">{consultasHoje.length} agora</span>
                <span className="text-green-600">{consultasFinalizadas.length} done</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={irParaHoje} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">Hoje</button>
              <button onClick={proximoDia} className="p-2 bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
        </div>
      </header>

      <button onClick={() => setShowModal('nova')} className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-40"><Plus className="w-7 h-7 text-white" /></button>

      <main className="p-4 pb-20">
        {activeTab === 'agenda' && (loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div> : consultas.length === 0 ? <div className="text-center py-12"><Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" /><p className="text-xl text-gray-600">Nenhuma consulta</p></div> : <div className="space-y-3">{consultas.map((c) => (<div key={c.id} onClick={() => { setConsultaSelecionada(c); setShowModal('detalhes') }} className="bg-white rounded-xl shadow-sm p-4 cursor-pointer"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full flex items-center justify-center ${c.status === 'finalizada' ? 'bg-green-100' : c.status === 'em_atendimento' ? 'bg-purple-100' : 'bg-blue-100'}`}><User className={`w-6 h-6 ${c.status === 'finalizada' ? 'text-green-600' : c.status === 'em_atendimento' ? 'text-purple-600' : 'text-blue-600'}`} /></div><div><p className="font-bold">{c.paciente?.nome}</p><p className="text-sm text-gray-500">{c.paciente?.cpf}</p></div></div><div className="text-right"><p className="font-bold text-lg">{c.hora}</p><Badge className={getStatusBadge(c.status)}>{c.status}</Badge></div></div></div>))}</div>)}
        {activeTab === 'pacientes' && (<div className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-3 bg-white rounded-xl" value={busca} onChange={(e) => setBusca(e.target.value)} /></div><div className="space-y-2">{pacientes.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase())).map((p) => (<div key={p.id} className="bg-white rounded-xl shadow-sm p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div><div className="flex-1"><p className="font-bold">{p.nome}</p><p className="text-sm text-gray-500">{p.cpf}</p></div></div></div>))}</div></div>)}
        {activeTab === 'relatorios' && (<div className="space-y-4"><Card><CardHeader><h3 className="text-lg font-bold">Resumo do Dia</h3></CardHeader><CardContent><div className="grid grid-cols-2 gap-4"><div className="bg-blue-50 p-4 rounded-xl text-center"><p className="text-3xl font-bold text-blue-600">{consultas.length}</p><p className="text-sm text-blue-600">Total</p></div><div className="bg-green-50 p-4 rounded-xl text-center"><p className="text-3xl font-bold text-green-600">{consultasFinalizadas.length}</p><p className="text-sm text-green-600">Concluídas</p></div><div className="bg-purple-50 p-4 rounded-xl text-center"><p className="text-3xl font-bold text-purple-600">R$ {consultas.reduce((a, c) => a + (c.valor || 0), 0)}</p><p className="text-sm text-purple-600">Receita</p></div><div className="bg-orange-50 p-4 rounded-xl text-center"><p className="text-3xl font-bold text-orange-600">{consultasAgendadas.length}</p><p className="text-sm text-orange-600">Pendentes</p></div></div></CardContent></Card></div>)}
      </main>

            {showModal === 'detalhes' && consultaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-50">
              <div>
                <h2 className="text-lg font-bold">Detalhes</h2>
                <p className="text-sm text-gray-500">{consultaSelecionada.data} • {consultaSelecionada.hora}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(null)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-lg">{consultaSelecionada.paciente?.nome}</p>
                  <p className="text-sm text-gray-500">CPF: {consultaSelecionada.paciente?.cpf || '-'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Horário</p><p className="font-medium">{consultaSelecionada.hora}</p></div></div>
                <div className="flex items-center gap-3"><Stethoscope className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Tipo</p><p className="font-medium">{consultaSelecionada.tipo}</p></div></div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Telefone</p><p className="font-medium">{formatarTelefone(consultaSelecionada.paciente?.telefone)}</p></div></div>
                <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Valor</p><p className="font-medium text-green-600">R$ {consultaSelecionada.valor}</p></div></div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <Badge className={getStatusBadge(consultaSelecionada.status)}>{consultaSelecionada.status}</Badge>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {consultaSelecionada.status === 'agendada' && (
                  <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'confirmada')} className="w-full bg-yellow-500">
                    <CheckCircle className="w-4 h-4 mr-2" />Confirmar
                  </Button>
                )}
                {consultaSelecionada.status === 'confirmada' && (
                  <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'em_atendimento')} className="w-full bg-purple-500">
                    <Activity className="w-4 h-4 mr-2" />Iniciar
                  </Button>
                )}
                {(consultaSelecionada.status === 'em_atendimento' || consultaSelecionada.status === 'confirmada') && (
                  <Button onClick={() => { setProntuario({ historico: '', exame: '', diagnostico: '', prescricao: '', retorno: '' }); setShowModal('prontuario') }} className="w-full bg-blue-500">
                    <FileText className="w-4 h-4 mr-2" />Prontuário
                  </Button>
                )}
                {consultaSelecionada.status === 'em_atendimento' && (
                  <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'finalizada')} className="w-full bg-green-500">
                    <Check className="w-4 h-4 mr-2" />Finalizar
                  </Button>
                )}
                <Button variant="destructive" onClick={() => atualizarStatus(consultaSelecionada.id, 'cancelada')}>
                  <XCircle className="w-4 h-4 mr-2" />Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showModal === 'prontuario' && consultaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-50">
              <div>
                <h2 className="text-lg font-bold">Prontuário</h2>
                <p className="text-sm text-gray-500">{consultaSelecionada.paciente?.nome}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(null)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Histórico</label>
                <textarea className="w-full p-3 border rounded-lg min-h-[80px]" placeholder="Sintomas..." value={prontuario.historico} onChange={(e) => setProntuario({...prontuario, historico: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Exames</label>
                <textarea className="w-full p-3 border rounded-lg min-h-[60px]" placeholder="Exames..." value={prontuario.exame} onChange={(e) => setProntuario({...prontuario, exame: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Diagnóstico</label>
                <input className="w-full p-3 border rounded-lg" placeholder="Diagnóstico..." value={prontuario.diagnostico} onChange={(e) => setProntuario({...prontuario, diagnostico: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prescrição</label>
                <textarea className="w-full p-3 border rounded-lg min-h-[80px]" placeholder="Receitas..." value={prontuario.prescricao} onChange={(e) => setProntuario({...prontuario, prescricao: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retorno</label>
                <input type="date" className="w-full p-3 border rounded-lg" value={prontuario.retorno} onChange={(e) => setProntuario({...prontuario, retorno: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(null)} className="flex-1">Cancelar</Button>
                <Button onClick={salvarProntuario} className="flex-1 bg-green-500"><Check className="w-4 h-4 mr-2" />Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showModal === 'nova' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold">Nova Consulta</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(null)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Paciente *</label>
                <select className="w-full p-3 border rounded-lg" value={novaConsulta.paciente_id} onChange={(e) => setNovaConsulta({...novaConsulta, paciente_id: e.target.value})}>
                  <option value="">Selecione</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome} - {p.cpf}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <input type="date" className="w-full p-3 border rounded-lg" value={novaConsulta.data} onChange={(e) => setNovaConsulta({...novaConsulta, data: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hora</label>
                  <select className="w-full p-3 border rounded-lg" value={novaConsulta.hora} onChange={(e) => setNovaConsulta({...novaConsulta, hora: e.target.value})}>
                    {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select className="w-full p-3 border rounded-lg" value={novaConsulta.tipo} onChange={(e) => setNovaConsulta({...novaConsulta, tipo: e.target.value})}>
                    <option value="particular">Particular</option>
                    <option value="convenio">Convênio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valor</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={novaConsulta.valor} onChange={(e) => setNovaConsulta({...novaConsulta, valor: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(null)} className="flex-1">Cancelar</Button>
                <Button onClick={criarConsulta} className="flex-1 bg-green-500"><Plus className="w-4 h-4 mr-2" />Criar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}