// src/pages/admin/MensagensPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Send, Mail, MessageSquare, Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Mensagem {
  id: string
  destinatario: string
  tipo: 'sms' | 'email'
  mensagem: string
  status: 'pendente' | 'enviado' | 'erro'
  data_envio: string
}

export function MensagensPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [form, setForm] = useState({
    destinatario: '',
    tipo: 'sms' as const,
    mensagem: '',
  })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    // Buscar mensagens enviadas
    const { data } = await supabase
      .from('mensagens')
      .select('*')
      .order('data_envio', { ascending: false })
      .limit(20)
    
    if (data) setMensagens(data)

    // Buscar pacientes para選擇
    const { data: pacientesData } = await supabase
      .from('pacientes')
      .select('id, nome, telefone, email')
      .order('nome')
      .limit(50)
    
    if (pacientesData) setPacientes(pacientesData)
  }

  const enviarMensagem = async () => {
    if (!form.destinatario || !form.mensagem) return

    setEnviando(true)

    // Aqui você integration com serviço de SMS/email
    // Por agora, só salva no banco
    await supabase.from('mensagens').insert({
      destinatario: form.destinatario,
      tipo: form.tipo,
      mensagem: form.mensagem,
      status: 'pendente',
      data_envio: new Date().toISOString(),
    })

    setForm({ destinatario: '', tipo: 'sms', mensagem: '' })
    buscarDados()
    setEnviando(false)
  }

  const getIcon = (tipo: string) => {
    return tipo === 'sms' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />
  }

  const getStatus = (status: string) => {
    switch (status) {
      case 'enviado': return <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />Enviado</span>
      case 'erro': return <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" />Erro</span>
      default: return <span className="flex items-center gap-1 text-yellow-600">Pendente</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
        <p className="text-gray-600">Enviar SMS ou Email para pacientes</p>
      </div>

      {/* Enviar Mensagem */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5" />
            Nova Mensagem
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, tipo: 'sms' })}
              className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                form.tipo === 'sms' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </button>
            <button
              onClick={() => setForm({ ...form, tipo: 'email' })}
              className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                form.tipo === 'email' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Destinatário</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              value={form.destinatario}
              onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
            >
              <option value="">Selecione...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.telefone}>
                  {p.nome} - {p.telefone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg min-h-[120px]"
              placeholder="Digite sua mensagem..."
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">{form.mensagem.length} caracteres</p>
          </div>

          <Button onClick={enviarMensagem} disabled={enviando || !form.destinatario || !form.mensagem}>
            <Send className="w-4 h-4 mr-2" />
            {enviando ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Mensagens Enviadas</h2>
        </CardHeader>
        <CardContent className="p-0">
          {mensagens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma mensagem enviada</div>
          ) : (
            <div className="divide-y">
              {mensagens.map((msg) => (
                <div key={msg.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getIcon(msg.tipo)}
                    </div>
                    <div>
                      <p className="font-medium">{msg.destinatario}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{msg.mensagem}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatus(msg.status)}
                    <p className="text-xs text-gray-500">{new Date(msg.data_envio).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}