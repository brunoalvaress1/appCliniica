// src/pages/admin/TarefasPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'

interface Tarefa {
  id: string
  titulo: string
  concluida: boolean
  prioridade: 'baixa' | 'media' | 'alta'
  data_criacao: string
}

export function TarefasPage() {
  const { user } = useAuthStore()
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [novaTarefa, setNovaTarefa] = useState('')
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta'>('media')

  useEffect(() => {
    buscarTarefas()
  }, [])

  const buscarTarefas = async () => {
    const { data } = await supabase
      .from('tarefas')
      .select('*')
      .order('data_criacao', { ascending: false })
    
    if (data) setTarefas(data)
  }

  const adicionarTarefa = async () => {
    if (!novaTarefa.trim()) return
    
    await supabase.from('tarefas').insert({
      titulo: novaTarefa,
      prioridade,
      concluida: false,
      data_criacao: new Date().toISOString(),
    })
    
    setNovaTarefa('')
    buscarTarefas()
  }

  const toggleTarefa = async (id: string, concluida: boolean) => {
    await supabase
      .from('tarefas')
      .update({ concluida: !concluida })
      .eq('id', id)
    
    buscarTarefas()
  }

  const excluirTarefa = async (id: string) => {
    await supabase.from('tarefas').delete().eq('id', id)
    buscarTarefas()
  }

  const tarefasPendentes = tarefas.filter(t => !t.concluida)
  const tarefasConcluidas = tarefas.filter(t => t.concluida)

  const getPrioridadeColor = (p: string) => {
    switch (p) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <p className="text-gray-600">Lista de tarefas da clínica</p>
      </div>

      {/* Adicionar tarefa */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tarefa..."
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarTarefa()}
              className="flex-1"
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as any)}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
            <Button onClick={adicionarTarefa}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pendentes ({tarefasPendentes.length})</h2>
        </CardHeader>
        <CardContent className="p-0">
          {tarefasPendentes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma tarefa pendiente
            </div>
          ) : (
            <div className="divide-y">
              {tarefasPendentes.map((tarefa) => (
                <div key={tarefa.id} className="p-4 flex items-center gap-3">
                  <button onClick={() => toggleTarefa(tarefa.id, tarefa.concluida)}>
                    <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  </button>
                  <span className="flex-1">{tarefa.titulo}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getPrioridadeColor(tarefa.prioridade)}`}>
                    {tarefa.prioridade}
                  </span>
                  <button onClick={() => excluirTarefa(tarefa.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Concluídas */}
      {tarefasConcluidas.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-500">Concluídas ({tarefasConcluidas.length})</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {tarefasConcluidas.map((tarefa) => (
                <div key={tarefa.id} className="p-4 flex items-center gap-3 opacity-50">
                  <button onClick={() => toggleTarefa(tarefa.id, tarefa.concluida)}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </button>
                  <span className="flex-1 line-through">{tarefa.titulo}</span>
                  <button onClick={() => excluirTarefa(tarefa.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}