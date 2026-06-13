import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Stethoscope, Phone, X, DollarSign, Plus, FileText, Activity, CheckCircle, XCircle, Bell, LogOut, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Paciente { id: string; nome: string; cpf: string; telefone: string }
interface Consulta { id: string; data: string; hora: string; status: string; valor: number; tipo: string; paciente_id: string; medico_id: string; paciente: Paciente }

export function AgendaConvenioPage() {
  const navigate = useNavigate()
  const [medicoId, setMedicoId] = useState('')
  const [medicoNome, setMedicoNome] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [novaConsulta, setNovaConsulta] = useState({ paciente_id: '', data: new Date().toISOString().split('T')[0], hora: '09:00' })

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
    await supabase.from('consultas').insert({ paciente_id: novaConsulta.paciente_id, medico_id: medicoId, data: novaConsulta.data, hora: novaConsulta.hora, tipo: 'convenio', valor: 0, status: 'agendada' })
    setShowModal(null)
    setNovaConsulta({ paciente_id: '', data: new Date().toISOString().split('T')[0], hora: '09:00' })
    buscarConsultas()
  }

  const atualizarStatus = async (id: string, status: string) => { await supabase.from('consultas').update({ status }).eq('id', id); buscarConsultas(); setShowModal(null) }

  const getStatusBadge = (status: string) => {
    const m: any = { agendada: 'bg-blue-100 text-blue-700', confirmada: 'bg-yellow-100 text-yellow-700', em_atendimento: 'bg-purple-100 text-purple-700', finalizada: 'bg-green-100 text-green-700', cancelada: 'bg-red-100 text-red-700' }
    return m[status] || 'bg-gray-100 text-gray-700'
  }

  const consultasAgendadas = consultas.filter(c => c.status === 'agendada' || c.status === 'confirmada')
  const consultasFinalizadas = consultas.filter(c => c.status === 'finalizada')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Stethoscope className="w-7 h-7" /></div>
            <div><h1 className="text-xl font-bold">Dr. {medicoNome}</h1><p className="text-sm text-green-100">Convênio</p></div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/medico/login') }} className="bg-white/20 px-3 py-2 rounded-lg"><LogOut className="w-5 h-5" /></button>
        </div>
        <div className="bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={diaAnterior} className="p-2 bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <div className="text-center flex-1">
              <p className="font-bold capitalize">{formatarData()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={irParaHoje} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">Hoje</button>
              <button onClick={proximoDia} className="p-2 bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <button onClick={() => setShowModal('nova')} className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-40"><Plus className="w-7 h-7 text-white" /></button>

      <main className="p-4">
        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div> : consultas.length === 0 ? <div className="text-center py-12"><Calendar className="w-20 h-20 text-gray-300 mx-auto" /><p className="mt-4">Nenhuma consulta</p></div> : <div className="space-y-3">{consultas.map((c) => (<div key={c.id} onClick={() => { setConsultaSelecionada(c); setShowModal('detalhes') }} className="bg-white rounded-xl p-4 cursor-pointer"><div className="flex justify-between"><div className="flex gap-3"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-green-600" /></div><div><p className="font-bold">{c.paciente?.nome}</p><p className="text-sm text-gray-500">{c.paciente?.cpf}</p></div></div><div className="text-right"><p className="font-bold">{c.hora}</p><Badge className={getStatusBadge(c.status)}>{c.status}</Badge></div></div></div>))}</div>}
      </main>

      {showModal === 'detalhes' && consultaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex justify-between bg-green-50">
              <div><h2 className="font-bold">Detalhes</h2><p className="text-sm">{consultaSelecionada.data} • {consultaSelecionada.hora}</p></div>
              <Button variant="ghost" onClick={() => setShowModal(null)}><X /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center"><User className="w-7 h-7 text-green-600" /></div>
                <div><p className="font-bold">{consultaSelecionada.paciente?.nome}</p><p className="text-sm">CPF: {consultaSelecionada.paciente?.cpf}</p></div>
              </div>
              <div><p className="text-sm text-gray-500">Telefone</p><p>{formatarTelefone(consultaSelecionada.paciente?.telefone)}</p></div>
              <div><p className="text-sm">Status</p><Badge className={getStatusBadge(consultaSelecionada.status)}>{consultaSelecionada.status}</Badge></div>
              <div className="flex flex-col gap-2">
                {consultaSelecionada.status === 'agendada' && <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'confirmada')} className="bg-yellow-500">Confirmar</Button>}
                {consultaSelecionada.status === 'confirmada' && <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'em_atendimento')} className="bg-purple-500">Iniciar</Button>}
                {consultaSelecionada.status === 'em_atendimento' && <Button onClick={() => atualizarStatus(consultaSelecionada.id, 'finalizada')} className="bg-green-500">Finalizar</Button>}
                <Button variant="danger" onClick={() => atualizarStatus(consultaSelecionada.id, 'cancelada')}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showModal === 'nova' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex justify-between">
              <h2 className="font-bold">Nova Consulta</h2>
              <Button variant="ghost" onClick={() => setShowModal(null)}><X /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><label className="block text-sm mb-2">Paciente</label><select className="w-full p-3 border rounded-lg" value={novaConsulta.paciente_id} onChange={(e) => setNovaConsulta({...novaConsulta, paciente_id: e.target.value})}><option value="">Selecione</option>{pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-2">Data</label><input type="date" className="w-full p-3 border rounded-lg" value={novaConsulta.data} onChange={(e) => setNovaConsulta({...novaConsulta, data: e.target.value})} /></div>
                <div><label className="block text-sm mb-2">Hora</label><select className="w-full p-3 border rounded-lg" value={novaConsulta.hora} onChange={(e) => setNovaConsulta({...novaConsulta, hora: e.target.value})}>{['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => <option key={h} value={h}>{h}</option>)}</select></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(null)} className="flex-1">Cancelar</Button>
                <Button onClick={criarConsulta} className="flex-1 bg-green-500">Criar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}