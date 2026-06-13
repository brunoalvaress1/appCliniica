// src/pages/admin/AvisosPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Bell, Plus, Trash2, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

interface Aviso {
  id: string
  titulo: string
  mensagem: string
  prioridade: 'baixa' | 'media' | 'alta'
  ativo: boolean
  data_criacao: string
}

export function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [novo, setNovo] = useState({ titulo: '', mensagem: '', prioridade: 'media' as const })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    buscarAvisos()
  }, [])

  const buscarAvisos = async () => {
    const { data } = await supabase
      .from('avisos')
      .select('*')
      .order('data_criacao', { ascending: false })
    
    if (data) setAvisos(data)
  }

  const criarAviso = async () => {
    if (!novo.titulo.trim() || !novo.mensagem.trim()) return
    
    setLoading(true)
    await supabase.from('avisos').insert({
      ...novo,
      ativo: true,
      data_criacao: new Date().toISOString(),
    })
    
    setNovo({ titulo: '', mensagem: '', prioridade: 'media' })
    buscarAvisos()
    setLoading(false)
  }

  const toggleAviso = async (id: string, ativo: boolean) => {
    await supabase.from('avisos').update({ ativo: !ativo }).eq('id', id)
    buscarAvisos()
  }

  const excluirAviso = async (id: string) => {
    await supabase.from('avisos').delete().eq('id', id)
    buscarAvisos()
  }

  const getCorPrioridade = (p: string) => {
    switch (p) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avisos</h1>
        <p className="text-gray-600">Comunicados da clínica</p>
      </div>

      {/* Novo Aviso */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Aviso
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Título"
            placeholder="Título do aviso"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Digite o aviso..."
              value={novo.mensagem}
              onChange={(e) => setNovo({ ...novo, mensagem: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={novo.prioridade}
              onChange={(e) => setNovo({ ...novo, prioridade: e.target.value as any })}
            >
              <option value="baixa">Baixa prioridade</option>
              <option value="media">Média prioridade</option>
              <option value="alta">Alta prioridade</option>
            </select>
            <Button onClick={criarAviso} disabled={loading || !novo.titulo || !novo.mensagem}>
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Avisos */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Avisos Publicados ({avisos.length})</h2>
        </CardHeader>
        <CardContent className="p-0">
          {avisos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum aviso publicado</div>
          ) : (
            <div className="divide-y">
              {avisos.map((aviso) => (
                <div key={aviso.id} className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{aviso.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getCorPrioridade(aviso.prioridade)}`}>
                        {aviso.prioridade}
                      </span>
                      {!aviso.ativo && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{aviso.mensagem}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatDate(aviso.data_criacao)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAviso(aviso.id, aviso.ativo)}
                      className={`text-sm ${aviso.ativo ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      {aviso.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => excluirAviso(aviso.id)} className="text-red-600 text-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
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