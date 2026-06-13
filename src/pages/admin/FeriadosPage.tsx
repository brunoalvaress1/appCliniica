// src/pages/admin/FeriadosPage.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Calendar, Plus, Trash2 } from 'lucide-react'

interface Feriado {
  id: string
  nome: string
  data: string
  tipo: 'nacional' | 'estadual' | 'facultativo'
}

export function FeriadosPage() {
  const [feriados, setFeriados] = useState<Feriado[]>([
    { id: '1', nome: 'Ano Novo', data: '01-01', tipo: 'nacional' },
    { id: '2', nome: 'Dia do Trabalho', data: '01-05', tipo: 'nacional' },
    { id: '3', nome: 'Independência', data: '07-09', tipo: 'nacional' },
    { id: '4', nome: 'Padroeira', data: '12-08', tipo: 'nacional' },
    { id: '5', nome: 'Natal', data: '25-12', tipo: 'nacional' },
  ])
  const [novo, setNovo] = useState({ nome: '', data: '', tipo: 'nacional' as const })

  const adicionar = () => {
    if (!novo.nome || !novo.data) return
    setFeriados([...feriados, { ...novo, id: Date.now().toString() }])
    setNovo({ nome: '', data: '', tipo: 'nacional' })
  }

  const remover = (id: string) => {
    setFeriados(feriados.filter(f => f.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feriados</h1>
        <p className="text-gray-600">Calendário de feriados</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Novo Feriado</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome do feriado"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={novo.data}
              onChange={(e) => setNovo({ ...novo, data: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                value={novo.tipo}
                onChange={(e) => setNovo({ ...novo, tipo: e.target.value as any })}
              >
                <option value="nacional">Nacional</option>
                <option value="estadual">Estadual</option>
                <option value="facultativo">Facultativo</option>
              </select>
            </div>
          </div>
          <Button onClick={adicionar} disabled={!novo.nome || !novo.data}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {feriados.map((feriado) => (
            <div key={feriado.id} className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{feriado.nome}</p>
                  <p className="text-sm text-gray-500 capitalize">{feriado.tipo}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-gray-500">{feriado.data}</p>
                <button onClick={() => remover(feriado.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}