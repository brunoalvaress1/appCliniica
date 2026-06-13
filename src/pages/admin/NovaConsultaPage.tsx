// src/pages/admin/NovaConsultaPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Save, Search, User, Calendar, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/utils'
import type { Medico, Paciente } from '../../types'

const consultaSchema = z.object({
  paciente_id: z.string().min(1, 'Selecione o paciente'),
  medico_id: z.string().min(1, 'Selecione o médico'),
  data: z.string().min(1, 'Selecione a data'),
  hora: z.string().min(1, 'Selecione o horário'),
  tipo: z.enum(['particular', 'convenio']),
  valor: z.string().min(1, 'Valor inválido'),
})

type ConsultaForm = z.infer<typeof consultaSchema>

export function NovaConsultaPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [buscaPaciente, setBuscaPaciente] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null)
  const [convenios, setConvenios] = useState<any[]>([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ConsultaForm>({
    resolver: zodResolver(consultaSchema),
  })

  const tipo = watch('tipo')

  useEffect(() => {
    buscarDados()
  }, [])

  const buscarDados = async () => {
    const [pacientesRes, medicosRes, conveniosRes] = await Promise.all([
      supabase.from('pacientes').select('*').order('nome'),
      supabase.from('medicos').select('*').eq('ativo', true).order('nome'),
      supabase.from('convenios').select('*').eq('ativo', true).order('nome_fantasia'),
    ])

    if (pacientesRes.data) setPacientes(pacientesRes.data)
    if (medicosRes.data) setMedicos(medicosRes.data)
    if (conveniosRes.data) setConvenios(conveniosRes.data)
  }

  const buscarPaciente = async () => {
    if (buscaPaciente.length < 3) return

    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .or(`nome.ilike.%${buscaPaciente}%,cpf.ilike.%${buscaPaciente}%`)
      .limit(10)

    if (data && data.length > 0) {
      setPacienteSelecionado(data[0])
      setValue('paciente_id', data[0].id)
    }
  }

  const onSubmit = async (data: ConsultaForm) => {
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('consultas').insert({
        paciente_id: data.paciente_id,
        medico_id: data.medico_id,
        data: data.data,
        hora: data.hora,
        tipo: data.tipo,
        valor: parseFloat(data.valor),
        status: 'agendada',
      })

      if (insertError) throw insertError

      navigate('/admin/agenda')
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar consulta')
    } finally {
      setLoading(false)
    }
  }

  const gerarHorarios = () => {
    const horarios = []
    for (let h = 8; h < 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        horarios.push(hora)
      }
    }
    return horarios
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/agenda')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
          <p className="text-gray-600">Agendar consulta</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Buscar Paciente</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={buscaPaciente}
                onChange={(e) => setBuscaPaciente(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={buscarPaciente}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>

            {pacienteSelecionado && (
              <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{pacienteSelecionado.nome}</p>
                  <p className="text-sm text-gray-500">CPF: {pacienteSelecionado.cpf}</p>
                </div>
              </div>
            )}

            {errors.paciente_id && (
              <p className="text-sm text-red-600">{errors.paciente_id.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Dados da Consulta</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Médico *
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('medico_id')}
              >
                <option value="">Selecione...</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome} - {medico.especialidade}
                  </option>
                ))}
              </select>
              {errors.medico_id && (
                <p className="mt-1 text-sm text-red-600">{errors.medico_id.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Data *"
                type="date"
                error={errors.data?.message}
                {...register('data')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Horário *
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('hora')}
                >
                  <option value="">Selecione...</option>
                  {gerarHorarios().map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Consulta
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="particular"
                    {...register('tipo')}
                  />
                  <span>Particular</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="convenio" {...register('tipo')} />
                  <span>Convênio</span>
                </label>
              </div>
            </div>

            <Input
              label="Valor (R$) *"
              placeholder="200"
              type="number"
              error={errors.valor?.message}
              {...register('valor')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/agenda')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Agendando...' : 'Agendar Consulta'}
          </Button>
        </div>
      </form>
    </div>
  )
}