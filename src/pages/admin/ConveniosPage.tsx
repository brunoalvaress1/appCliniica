// src/pages/admin/ConveniosPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, Copy, Check, Pencil, DollarSign, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Convenio {
  id: string
  nome_fantasia: string
  cnpj: string
  telefone: string
  email: string
  valor_consulta: number
  valor_retorno: number
  limite_diario: number
  nao_atende_sexta: boolean
  nao_atende_segunda: boolean
  horario_inicio: string
  horario_fim: string
  login_email: string
  ativo: boolean
}

export function ConveniosPage() {
  const [convenios, setConvenios] = useState<Convenio[]>([])
  const [loading, setLoading] = useState(true)
  const [showCriar, setShowCriar] = useState(false)
  const [editarId, setEditarId] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  
  const [novo, setNovo] = useState({
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    email: '',
    valor_consulta: '150',
    valor_retorno: '100',
    limite_diario: '10',
    nao_atende_sexta: false,
    nao_atende_segunda: false,
    horario_inicio: '08:00',
    horario_fim: '18:00',
  })

  useEffect(() => {
    buscarConvenios()
  }, [])

  const buscarConvenios = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('convenios')
      .select('*')
      .order('nome_fantasia', { ascending: true })
    setConvenios(data || [])
    setLoading(false)
  }

  const criarConvenio = async () => {
    if (!novo.nome_fantasia.trim()) return
    const loginEmail = novo.nome_fantasia.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') + '@musumeci.com'

    await supabase.from('convenios').insert({
      nome_fantasia: novo.nome_fantasia,
      cnpj: novo.cnpj || null,
      telefone: novo.telefone || null,
      email: novo.email || null,
      valor_consulta: parseFloat(novo.valor_consulta) || 0,
      valor_retorno: parseFloat(novo.valor_retorno) || 0,
      limite_diario: parseInt(novo.limite_diario) || 10,
      nao_atende_sexta: novo.nao_atende_sexta,
      nao_atende_segunda: novo.nao_atende_segunda,
      horario_inicio: novo.horario_inicio,
      horario_fim: novo.horario_fim,
      login_email: loginEmail,
      login_senha: '123456',
    })

    await supabase.from('usuarios').insert({
      email: loginEmail,
      senha: '123456',
      nome: novo.nome_fantasia,
      tipo: 'convenio'
    })
    
    setShowCriar(false)
    resetarForm()
    buscarConvenios()
  }

  const atualizarConvenio = async () => {
    if (!editarId) return
    await supabase.from('convenios').update({
      nome_fantasia: novo.nome_fantasia,
      cnpj: novo.cnpj || null,
      telefone: novo.telefone || null,
      email: novo.email || null,
      valor_consulta: parseFloat(novo.valor_consulta) || 0,
      valor_retorno: parseFloat(novo.valor_retorno) || 0,
      limite_diario: parseInt(novo.limite_diario) || 10,
      nao_atende_sexta: novo.nao_atende_sexta,
      nao_atende_segunda: novo.nao_atende_segunda,
      horario_inicio: novo.horario_inicio,
      horario_fim: novo.horario_fim,
    }).eq('id', editarId)

    setEditarId(null)
    resetarForm()
    buscarConvenios()
  }

  const excluirConvenio = async (id: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este convênio? Esta ação não pode ser desfeita!')) return
    await supabase.from('convenios').delete().eq('id', id)
    buscarConvenios()
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('convenios').update({ ativo: !ativo }).eq('id', id)
    buscarConvenios()
  }

  const copiarLogin = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopied(email)
    setTimeout(() => setCopied(''), 2000)
  }

  const editarConvenio = (conv: Convenio) => {
    setEditarId(conv.id)
    setNovo({
      nome_fantasia: conv.nome_fantasia,
      cnpj: conv.cnpj || '',
      telefone: conv.telefone || '',
      email: conv.email || '',
      valor_consulta: conv.valor_consulta?.toString() || '150',
      valor_retorno: conv.valor_retorno?.toString() || '100',
      limite_diario: conv.limite_diario?.toString() || '10',
      nao_atende_sexta: conv.nao_atende_sexta || false,
      nao_atende_segunda: conv.nao_atende_segunda || false,
      horario_inicio: conv.horario_inicio || '08:00',
      horario_fim: conv.horario_fim || '18:00',
    })
    setShowCriar(true)
  }

  const resetarForm = () => {
    setNovo({
      nome_fantasia: '',
      cnpj: '',
      telefone: '',
      email: '',
      valor_consulta: '150',
      valor_retorno: '100',
      limite_diario: '10',
      nao_atende_sexta: false,
      nao_atende_segunda: false,
      horario_inicio: '08:00',
      horario_fim: '18:00',
    })
  }

  const cancelar = () => {
    setShowCriar(false)
    setEditarId(null)
    resetarForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convênios</h1>
          <p className="text-gray-600">Gerenciar convênios</p>
        </div>
        <Button onClick={() => setShowCriar(!showCriar)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Convênio
        </Button>
      </div>

      {showCriar && (
        <Card className="border-teal-200">
          <CardHeader className="bg-teal-50">
            <h2 className="text-lg font-semibold text-teal-800">
              {editarId ? 'Editar Convênio' : 'Novo Convênio'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dados básicos */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Dados Básicos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nome Fantasia *"
                  placeholder="Ex: Unimed, Amil..."
                  value={novo.nome_fantasia}
                  onChange={(e) => setNovo({ ...novo, nome_fantasia: e.target.value })}
                />
                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0001-00"
                  value={novo.cnpj}
                  onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={novo.telefone}
                  onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
                />
                <Input
                  label="Email"
                  placeholder="unimed@exemplo.com"
                  value={novo.email}
                  onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                />
              </div>
            </div>

            {/* Valores */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valores
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Valor Consulta (R$)"
                  type="number"
                  value={novo.valor_consulta}
                  onChange={(e) => setNovo({ ...novo, valor_consulta: e.target.value })}
                />
                <Input
                  label="Valor Retorno (R$)"
                  type="number"
                  value={novo.valor_retorno}
                  onChange={(e) => setNovo({ ...novo, valor_retorno: e.target.value })}
                />
                <Input
                  label="Limite/Dia"
                  type="number"
                  value={novo.limite_diario}
                  onChange={(e) => setNovo({ ...novo, limite_diario: e.target.value })}
                />
              </div>
            </div>

            {/* Horários */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Horários de Atendimento
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Início"
                  type="time"
                  value={novo.horario_inicio}
                  onChange={(e) => setNovo({ ...novo, horario_inicio: e.target.value })}
                />
                <Input
                  label="Fim"
                  type="time"
                  value={novo.horario_fim}
                  onChange={(e) => setNovo({ ...novo, horario_fim: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dias de folga</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNovo({ ...novo, nao_atende_segunda: !novo.nao_atende_segunda })}
                      className={`flex-1 py-2 rounded ${novo.nao_atende_segunda ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                      Seg
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovo({ ...novo, nao_atende_sexta: !novo.nao_atende_sexta })}
                      className={`flex-1 py-2 rounded ${novo.nao_atende_sexta ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                      Sex
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4 border-t">
              {editarId ? (
                <>
                  <Button onClick={atualizarConvenio} className="flex-1 bg-teal-600">
                    <Pencil className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={cancelar}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={criarConvenio} className="w-full bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Convênio
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : convenios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum convênio encontrado</p>
          <Button onClick={() => setShowCriar(true)} className="mt-4">
            Criar primeiro convênio
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {convenios.map((conv) => (
            <Card key={conv.id} className={`overflow-hidden ${!conv.ativo ? 'opacity-50' : ''}`}>
              {/* Header do card */}
              <div className={`px-4 py-3 flex items-center justify-between ${conv.ativo ? 'bg-teal-600' : 'bg-gray-400'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{conv.nome_fantasia}</h3>
                    <p className="text-xs text-white/80">{conv.cnpj || 'Sem CNPJ'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editarConvenio(conv)}
                    className="p-2 bg-white/20 rounded-lg"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => excluirConvenio(conv.id)}
                    className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => toggleAtivo(conv.id, conv.ativo)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${conv.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}
                  >
                    {conv.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600">Consulta</p>
                    <p className="text-xl font-bold text-green-700">R$ {conv.valor_consulta?.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600">Retorno</p>
                    <p className="text-xl font-bold text-green-700">R$ {conv.valor_retorno?.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600">Limite</p>
                    <p className="text-xl font-bold text-blue-700">{conv.limite_diario || 10}</p>
                  </div>
                </div>

                {/* Horários */}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {conv.horario_inicio || '08:00'} - {conv.horario_fim || '18:00'}
                  </span>
                  <div className="flex gap-1">
                    {conv.nao_atende_segunda && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Seg</span>
                    )}
                    {conv.nao_atende_sexta && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">Sex</span>
                    )}
                  </div>
                </div>

                {/* Login */}
                <div className="mt-3 p-2 bg-gray-50 rounded flex items-center justify-between">
                  <code className="text-sm">{conv.login_email}</code>
                  <button onClick={() => copiarLogin(conv.login_email)}>
                    {copied === conv.login_email ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}