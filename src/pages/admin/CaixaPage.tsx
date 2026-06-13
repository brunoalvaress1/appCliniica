// src/pages/admin/CaixaPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { DollarSign, Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/utils'

interface Movimento {
  id: string
  descricao: string
  tipo: 'entrada' | 'saida'
  valor: number
  categoria: string
  data: string
}

const categoriasEntrada = ['Consulta', 'Retorno', 'Procedimento', 'Outros']
const categoriasSaida = ['Material', 'Medicamento', 'Salário', 'Aluguel', 'Contas', 'Outros']

export function CaixaPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([])
  const [novo, setNovo] = useState({ descricao: '', valor: '', tipo: 'entrada' as const, categoria: 'Consulta' })
  const [saldo, setSaldo] = useState(0)

  useEffect(() => {
    buscarMovimentos()
  }, [])

  const buscarMovimentos = async () => {
    const { data } = await supabase
      .from('caixa')
      .select('*')
      .order('data', { ascending: false })
      .limit(50)
    
    if (data) {
      setMovimentos(data)
      const total = data.reduce((acc, m) => 
        m.tipo === 'entrada' ? acc + m.valor : acc - m.valor
      , 0)
      setSaldo(total)
    }
  }

  const adicionarMovimento = async () => {
    if (!novo.descricao || !novo.valor) return
    
    await supabase.from('caixa').insert({
      descricao: novo.descricao,
      valor: parseFloat(novo.valor),
      tipo: novo.tipo,
      categoria: novo.categoria,
      data: new Date().toISOString(),
    })
    
    setNovo({ descricao: '', valor: '', tipo: 'entrada', categoria: 'Consulta' })
    buscarMovimentos()
  }

  const excluirMovimento = async (id: string) => {
    await supabase.from('caixa').delete().eq('id', id)
    buscarMovimentos()
  }

  const categorias = novo.tipo === 'entrada' ? categoriasEntrada : categoriasSaida

  const entradas = movimentos.filter(m => m.tipo === 'entrada')
  const saidas = movimentos.filter(m => m.tipo === 'saida')
  const totalEntradas = entradas.reduce((acc, m) => acc + m.valor, 0)
  const totalSaidas = saidas.reduce((acc, m) => acc + m.valor, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
        <p className="text-gray-600">Controle de entrada e saída</p>
      </div>

      {/* Saldo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Entradas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Saídas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Saldo</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/*Novo Movimento */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Movimento
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setNovo({ ...novo, tipo: 'entrada', categoria: 'Consulta' })}
              className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                novo.tipo === 'entrada' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100'
              }`}
            >
              <ArrowDown className="w-4 h-4" />
              Entrada
            </button>
            <button
              onClick={() => setNovo({ ...novo, tipo: 'saida', categoria: 'Material' })}
              className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 ${
                novo.tipo === 'saida' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
              Saída
            </button>
          </div>
          <Input
            label="Descrição"
            placeholder="Descrição do movimento"
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              placeholder="0,00"
              type="number"
              value={novo.valor}
              onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                value={novo.categoria}
                onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
              >
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={adicionarMovimento} disabled={!novo.descricao || !novo.valor}>
            <DollarSign className="w-4 h-4 mr-2" />
            Registrar
          </Button>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Últimos Movimentos</h2>
        </CardHeader>
        <CardContent className="p-0">
          {movimentos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum movimento</div>
          ) : (
            <div className="divide-y">
              {movimentos.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      m.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {m.tipo === 'entrada' ? (
                        <ArrowDown className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUp className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{m.descricao}</p>
                      <p className="text-sm text-gray-500">
                        {m.categoria} • {formatDate(m.data)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold ${
                      m.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {m.tipo === 'entrada' ? '+' : '-'}{formatCurrency(m.valor)}
                    </p>
                    <button onClick={() => excluirMovimento(m.id)} className="text-red-600">
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