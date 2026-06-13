// src/pages/admin/MedicosPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, Pencil, Trash2, Search, User, Stethoscope, Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Medico {
  id: string
  nome: string
  crm: string
  especialidade: string
  telefone: string
  email: string
  valor_consulta: number
  ativo: boolean
}

export function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editarId, setEditarId] = useState<string | null>(null)
  
  const [novo, setNovo] = useState({
    nome: '',
    crm: '',
    especialidade: 'Otorrinolaringologia',
    telefone: '',
    email: '',
    valor_consulta: '200',
  })

  useEffect(() => {
    buscarMedicos()
  }, [])

  const buscarMedicos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('medicos')
      .select('*')
      .order('nome', { ascending: true })
    setMedicos(data || [])
    setLoading(false)
  }

  const criarMedico = async () => {
    if (!novo.nome.trim() || !novo.crm.trim()) return

    await supabase.from('medicos').insert({
      nome: novo.nome,
      crm: novo.crm,
      especialidade: novo.especialidade,
      telefone: novo.telefone || null,
      email: novo.email || null,
      valor_consulta: parseFloat(novo.valor_consulta) || 0,
    })

    setShowForm(false)
    resetarForm()
    buscarMedicos()
  }

  const atualizarMedico = async () => {
    if (!editarId) return

    await supabase.from('medicos').update({
      nome: novo.nome,
      crm: novo.crm,
      especialidade: novo.especialidade,
      telefone: novo.telefone || null,
      email: novo.email || null,
      valor_consulta: parseFloat(novo.valor_consulta) || 0,
    }).eq('id', editarId)

    setEditarId(null)
    setShowForm(false)
    resetarForm()
    buscarMedicos()
  }

  const excluirMedico = async (id: string) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este médico? Esta ação não pode ser desfeita!')) return
    await supabase.from('medicos').delete().eq('id', id)
    buscarMedicos()
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('medicos').update({ ativo: !ativo }).eq('id', id)
    buscarMedicos()
  }

  const editarMedico = (med: Medico) => {
    setEditarId(med.id)
    setNovo({
      nome: med.nome,
      crm: med.crm,
      especialidade: med.especialidade,
      telefone: med.telefone || '',
      email: med.email || '',
      valor_consulta: med.valor_consulta?.toString() || '200',
    })
    setShowForm(true)
  }

  const resetarForm = () => {
    setNovo({
      nome: '',
      crm: '',
      especialidade: 'Otorrinolaringologia',
      telefone: '',
      email: '',
      valor_consulta: '200',
    })
  }

  const cancelar = () => {
    setShowForm(false)
    setEditarId(null)
    resetarForm()
  }

  const medicosFiltrados = medicos.filter(m => 
    m.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(busca.toLowerCase()) ||
    m.crm?.includes(busca)
  )

  const especialidades = [
    'Otorrinolaringologia',
    'Clínica Geral',
    'Pediatria',
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Ortopedia',
    'Neurologia',
    'Oftalmologia',
    'Outro',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
          <p className="text-gray-600">Gerenciar médicos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Médico
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200">
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nome *"
                placeholder="Dr. Nome Sobrenome"
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              />
              <Input
                label="CRM *"
                placeholder="123456-SP"
                value={novo.crm}
                onChange={(e) => setNovo({ ...novo, crm: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  value={novo.especialidade}
                  onChange={(e) => setNovo({ ...novo, especialidade: e.target.value })}
                >
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={novo.telefone}
                onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
              />
              <Input
                label="Valor Consulta (R$)"
                type="number"
                value={novo.valor_consulta}
                onChange={(e) => setNovo({ ...novo, valor_consulta: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              {editarId ? (
                <>
                  <Button onClick={atualizarMedico} className="flex-1 bg-blue-600">
                    <Pencil className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={cancelar}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={criarMedico} className="w-full bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Médico
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar médicos..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : medicosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum médico encontrado</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Criar primeiro médico
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicosFiltrados.map((medico) => (
            <Card key={medico.id} className={`overflow-hidden ${!medico.ativo ? 'opacity-50' : ''}`}>
              <div className={`px-4 py-3 flex items-center justify-between ${medico.ativo ? 'bg-blue-600' : 'bg-gray-400'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{medico.nome}</h3>
                    <p className="text-xs text-white/80">{medico.especialidade}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editarMedico(medico)}
                    className="p-2 bg-white/20 rounded-lg"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => excluirMedico(medico.id)}
                    className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => toggleAtivo(medico.id, medico.ativo)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${medico.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}
                  >
                    {medico.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">CRM: {medico.crm}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{medico.telefone || 'Não cadastrado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{medico.email || 'Não cadastrado'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-center">
                    <span className="text-gray-500">Valor da consulta: </span>
                    <span className="text-xl font-bold text-blue-600">R$ {medico.valor_consulta?.toFixed(2)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}