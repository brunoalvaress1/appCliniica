    // src/pages/admin/AgendamentoOnlinePage.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Calendar, Clock, User, Video, MapPin, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ConfigAgendamento {
  ativo: boolean
  antecedencia_dias: number
  horario_inicio: string
  horario_fim: string
  duracao_consulta: number
  permite_online: boolean
  link_consulta: string
  endereco_clinica: string
}

export function AgendamentoOnlinePage() {
  const [config, setConfig] = useState<ConfigAgendamento>({
    ativo: true,
    antecedencia_dias: 30,
    horario_inicio: '08:00',
    horario_fim: '18:00',
    duracao_consulta: 30,
    permite_online: true,
    link_consulta: 'https://meet.google.com/',
    endereco_clinica: '',
  })
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    buscarConfig()
  }, [])

  const buscarConfig = async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('chave, valor')
      .in('chave', ['antecedencia_dias', 'horario_inicio', 'horario_fim', 'duracao_consulta', 'permite_online', 'link_consulta', 'endereco_clinica'])
    
    if (data) {
      const configObj: any = {}
      data.forEach((item) => {
        configObj[item.chave] = item.valor
      })
      setConfig((prev) => ({ ...prev, ...configObj }))
    }
  }

  const salvar = async () => {
    const configuracoes = [
      { chave: 'antecedencia_dias', valor: config.antecedencia_dias },
      { chave: 'horario_inicio', valor: config.horario_inicio },
      { chave: 'horario_fim', valor: config.horario_fim },
      { chave: 'duracao_consulta', valor: config.duracao_consulta },
      { chave: 'permite_online', valor: config.permite_online ? 'true' : 'false' },
      { chave: 'link_consulta', valor: config.link_consulta },
      { chave: 'endereco_clinica', valor: config.endereco_clinica },
    ]

    for (const conf of configuracoes) {
      await supabase
        .from('configuracoes')
        .upsert({ chave: conf.chave, valor: conf.valor }, { onConflict: 'chave' })
    }

    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendamento Online</h1>
        <p className="text-gray-600">Configurações para pacientes agendarem online</p>
      </div>

      {salvo && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Configurações salvas!
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Status</h2>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.ativo}
              onChange={(e) => setConfig({ ...config, ativo: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="font-medium">Agendamento online ativado</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Horários de Atendimento
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duração consulta (min)"
              type="number"
              value={config.duracao_consulta}
              onChange={(e) => setConfig({ ...config, duracao_consulta: parseInt(e.target.value) })}
            />
            <Input
              label="Antecipação (dias)"
              type="number"
              value={config.antecedencia_dias}
              onChange={(e) => setConfig({ ...config, antecedencia_dias: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" />
            Consulta Online
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.permite_online}
              onChange={(e) => setConfig({ ...config, permite_online: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="font-medium">Permitir teleconsulta</span>
          </label>
          {config.permite_online && (
            <Input
              label="Link da vídeo chamada"
              placeholder="https://meet.google.com/..."
              value={config.link_consulta}
              onChange={(e) => setConfig({ ...config, link_consulta: e.target.value })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço da Clínica
          </h2>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            placeholder="Endereço completo..."
            value={config.endereco_clinica}
            onChange={(e) => setConfig({ ...config, endereco_clinica: e.target.value })}
          />
        </CardContent>
      </Card>

      <Button onClick={salvar} className="w-full">
        <CheckCircle className="w-4 h-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  )
}