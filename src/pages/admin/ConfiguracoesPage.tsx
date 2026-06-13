// src/pages/admin/ConfiguracoesPage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Save, Cog, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Configuracoes {
  nome_clinica: string
  telefone: string
  endereco: string
  email: string
  horario_inicio: string
  horario_fim: string
  intervalo_consulta: string
}

export function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [config, setConfig] = useState<Configuracoes>({
    nome_clinica: '',
    telefone: '',
    endereco: '',
    email: '',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    intervalo_consulta: '30',
  })

  useEffect(() => {
    buscarConfig()
  }, [])

  const buscarConfig = async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('chave, valor')

    if (data) {
      const configObj: any = {}
      data.forEach((item) => {
        configObj[item.chave] = item.valor
      })
      setConfig((prev) => ({ ...prev, ...configObj }))
    }
  }

  const salvar = async () => {
    setLoading(true)
    setSalvo(false)

    const configuracoes = [
      { chave: 'nome_clinica', valor: config.nome_clinica },
      { chave: 'telefone', valor: config.telefone },
      { chave: 'endereco', valor: config.endereco },
      { chave: 'email', valor: config.email },
      { chave: 'horario_inicio', valor: config.horario_inicio },
      { chave: 'horario_fim', valor: config.horario_fim },
      { chave: 'intervalo_consulta', valor: config.intervalo_consulta },
    ]

    for (const conf of configuracoes) {
      await supabase
        .from('configuracoes')
        .upsert({ chave: conf.chave, valor: conf.valor }, { onConflict: 'chave' })
    }

    setLoading(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Configurações da clínica</p>
      </div>

      {salvo && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Configurações salvas com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cog className="w-5 h-5" />
            Dados da Clínica
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome da Clínica"
            value={config.nome_clinica}
            onChange={(e) => setConfig({ ...config, nome_clinica: e.target.value })}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={config.telefone}
              onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
              icon={<Phone className="w-5 h-5" />}
            />
            <Input
              label="Email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              icon={<Mail className="w-5 h-5" />}
            />
          </div>
          <Input
            label="Endereço"
            value={config.endereco}
            onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
            icon={<MapPin className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Início"
              type="time"
              value={config.horario_inicio}
              onChange={(e) => setConfig({ ...config, horario_inicio: e.target.value })}
            />
            <Input
              label="Fim"
              type="time"
              value={config.horario_fim}
              onChange={(e) => setConfig({ ...config, horario_fim: e.target.value })}
            />
            <Input
              label="Intervalo (min)"
              type="number"
              value={config.intervalo_consulta}
              onChange={(e) => setConfig({ ...config, intervalo_consulta: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}