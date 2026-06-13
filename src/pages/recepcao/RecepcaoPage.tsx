// src/pages/recepcao/RecepcaoPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  Calendar, Phone, MessageCircle, 
  ChevronLeft, ChevronRight, LogOut, 
  Clock, CreditCard, User, Stethoscope,
  Check, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, addDays, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Paciente {
  id: string
  nome: string
  cpf: string
  telefone: string
  whatsapp: string
  data_nascimento: string
  cidade: string
}

interface Consulta {
  id: string
  data: string
  hora: string
  tipo: string
  valor: number
  status: string
  observacoes: string
  paciente: Paciente
  medico: { nome: string }
}

export function RecepcaoPage() {
  const navigate = useNavigate()
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState<string | null>(null)

  useEffect(() => {
    buscarConsultas()
  }, [dataSelecionada])

  const buscarConsultas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('consultas')
      .select(`
        *,
        paciente:pacientes(nome, cpf, telefone, whatsapp, data_nascimento, cidade),
        medico:medicos(nome)
      `)
      .eq('data', dataSelecionada)
      .in('status', ['agendada', 'confirmada'])
      .order('hora')
    
    if (data) setConsultas(data)
    setLoading(false)
  }

  // Formatar telefone
  const formatarTelefone = (tel: string | null | undefined) => {
    if (!tel) return '-'
    const numeros = tel.replace(/\D/g, '')
    if (numeros.length === 10) {
      return `(${numeros.slice(2, 4)}) ${numeros.slice(4, 9)}-${numeros.slice(9)}`
    } else if (numeros.length === 11) {
      return `(${numeros.slice(2, 4)}) ${numeros.slice(4, 9)}-${numeros.slice(9)}`
    }
    return tel
  }

  // Calcular idade
  const calcularIdade = (dataNasc: string) => {
    if (!dataNasc) return ''
    const nasc = parseISO(dataNasc)
    const hoje = new Date()
    let idade = hoje.getFullYear() - nasc.getFullYear()
    const mes = hoje.getMonth() - nasc.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--
    }
    return idade > 0 ? `${idade} anos` : ''
  }

  // Dias até a consulta
  const diasAteConsulta = (dataConsulta: string) => {
    const data = parseISO(dataConsulta)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    return differenceInDays(data, hoje)
  }

  // Cores según dias restantes
  const getUrgencia = (dataConsulta: string) => {
    const dias = diasAteConsulta(dataConsulta)
    if (dias === 0) return { cor: 'bg-red-100 border-l-4 border-l-red-500', badge: 'text-red-600', label: 'HOJE!' }
    if (dias === 1) return { cor: 'bg-orange-50 border-l-4 border-l-orange-500', badge: 'text-orange-600', label: 'Amanhã!' }
    if (dias <= 3) return { cor: 'bg-yellow-50 border-l-4 border-l-yellow-500', badge: 'text-yellow-600', label: `${dias} dias` }
    return { cor: 'bg-white', badge: 'text-gray-500', label: `${dias} dias` }
  }

  // Abrir WhatsApp
  const abrirWhatsApp = (consulta: Consulta) => {
    const tel = consulta.paciente?.whatsapp?.replace(/\D/g, '') || consulta.paciente?.telefone?.replace(/\D/g, '') || ''
    const telFormatado = tel.startsWith('55') ? tel : '55' + tel
    const dias = diasAteConsulta(consulta.data)
    
    let msg = ''
    if (dias === 0) {
      msg = `Olá ${consulta.paciente?.nome?.split(' ')[0]}! ` +
        `Sua consulta com ${consulta.medico?.nome} é HOJE às ${consulta.hora?.substring(0, 5)}. ` +
        `Nous aguarda!`
    } else if (dias === 1) {
      msg = `Olá ${consulta.paciente?.nome?.split(' ')[0]}! ` +
        `Sua consulta com ${consulta.medico?.nome} é AMANHÃ às ${consulta.hora?.substring(0, 5)}. ` +
        `Por favor, nos responda se ainda deseja Comparecer.`
    } else {
      msg = `Olá ${consulta.paciente?.nome?.split(' ')[0]}! ` +
        `Gostariamos de confirmar sua consulta com ${consulta.medico?.nome} ` +
        `no dia ${format(parseISO(consulta.data), "dd 'de' MMMM", { locale: ptBR })} às ${consulta.hora?.substring(0, 5)}. ` +
        `Por favor, nos responda se ainda deseja Comparecer ou sePrefere remarcar.`
    }
    
    setEnviando(consulta.id)
    window.open(`https://wa.me/${telFormatado}?text=${encodeURIComponent(msg)}`, '_blank')
    setTimeout(() => setEnviando(null), 2000)
  }

  const navegarDia = (dias: number) => {
    const novaData = addDays(parseISO(dataSelecionada), dias)
    setDataSelecionada(format(novaData, 'yyyy-MM-dd'))
  }

  const dataFormatada = format(parseISO(dataSelecionada), "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Clínica Musumeci</h1>
                <p className="text-sm text-teal-100">Painel de Recepção</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Navegação */}
        <div className="bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navegarDia(-1)}
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 capitalize">
                {dataFormatada}
              </p>
              <p className="text-sm text-gray-500">
                {consultas.length} consulta(s)
              </p>
            </div>
            
            <button 
              onClick={() => navegarDia(1)}
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Lista de Consultas */}
      <main className="p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : consultas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 font-medium">Nenhuma consulta</p>
            <p className="text-gray-500">Neste dia não há consultas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-red-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">
                  {consultas.filter(c => diasAteConsulta(c.data) === 0).length}
                </p>
                <p className="text-xs text-red-600">Hoje</p>
              </div>
              <div className="flex-1 bg-orange-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-600">
                  {consultas.filter(c => diasAteConsulta(c.data) === 1).length}
                </p>
                <p className="text-xs text-orange-600">Amanhã</p>
              </div>
              <div className="flex-1 bg-yellow-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-600">
                  {consultas.filter(c => diasAteConsulta(c.data) <= 3 && diasAteConsulta(c.data) > 1).length}
                </p>
                <p className="text-xs text-yellow-600">Próximos</p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-600">
                  {consultas.filter(c => diasAteConsulta(c.data) > 3).length}
                </p>
                <p className="text-xs text-gray-600">Later</p>
              </div>
            </div>

            {consultas.map((consulta) => {
              const urgencia = getUrgencia(consulta.data)
              
              return (
                <div 
                  key={consulta.id} 
                  className={`rounded-lg shadow-sm ${urgencia.cor}`}
                >
                  {/* Header do Card */}
                  <div className="flex items-center justify-between px-4 py-2 bg-black/5 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{consulta.hora?.substring(0, 5)}</span>
                      <span className="text-gray-500">-</span>
                      <span>{consulta.medico?.nome}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${urgencia.badge} bg-white`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {urgencia.label}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {/* Nome */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {consulta.paciente?.nome}
                    </h3>

                    {/* Informações em grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{consulta.paciente?.cpf || 'Sem CPF'}</span>
                      </div>
                      {consulta.paciente?.data_nascimento && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{calcularIdade(consulta.paciente.data_nascimento)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>📱 {formatarTelefone(consulta.paciente?.telefone)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>{consulta.tipo === 'particular' ? 'Particular' : consulta.tipo}</span>
                      </div>
                    </div>

                    {/* Cidade */}
                    {consulta.paciente?.cidade && (
                      <p className="text-sm text-gray-500 mb-3">
                        📍 {consulta.paciente.cidade}
                      </p>
                    )}

                    {/* Observações */}
                    {consulta.observacoes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                        📝 {consulta.observacoes}
                      </div>
                    )}

                    {/* Botão WhatsApp */}
                    <button
                      onClick={() => abrirWhatsApp(consulta)}
                      disabled={enviando === consulta.id}
                      className={`w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium ${
                        enviando === consulta.id 
                          ? 'bg-green-700 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {enviando === consulta.id ? 'Enviando...' : 'Confirmar via WhatsApp'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}