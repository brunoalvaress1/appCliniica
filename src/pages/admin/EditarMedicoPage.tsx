// src/pages/admin/EditarMedicoPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ESPECIALIDADES } from '../../types'

const medicoSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório'),
  crm: z.string().min(3, 'CRM é obrigatório'),
  especialidade: z.string().min(1, 'Selecione a especialidade'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  valor_consulta: z.string().min(1, 'Valor é obrigatório'),
})

type MedicoForm = z.infer<typeof medicoSchema>

export function EditarMedicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MedicoForm>({
    resolver: zodResolver(medicoSchema),
  })

  useEffect(() => {
    if (id) buscarMedico()
  }, [id])

  const buscarMedico = async () => {
    const { data } = await supabase
      .from('medicos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) reset(data)
  }

  const onSubmit = async (data: MedicoForm) => {
    setLoading(true)
    setError('')

    try {
      await supabase
        .from('medicos')
        .update({
          nome: data.nome,
          crm: data.crm,
          especialidade: data.especialidade,
          telefone: data.telefone,
          email: data.email || null,
          valor_consulta: parseFloat(data.valor_consulta),
        })
        .eq('id', id)

      navigate('/admin/medicos')
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar médico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/medicos')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Médico</h1>
          <p className="text-gray-600">Atualizar dados do médico</p>
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
            <h2 className="text-lg font-semibold">Dados do Médico</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome Completo *"
              placeholder="Dr. João da Silva"
              error={errors.nome?.message}
              {...register('nome')}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="CRM *"
                placeholder="12345-SP"
                error={errors.crm?.message}
                {...register('crm')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Especialidade *</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('especialidade')}
                >
                  <option value="">Selecione...</option>
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp.id} value={esp.nome}>{esp.nome}</option>
                  ))}
                </select>
                {errors.especialidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.especialidade.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Telefone *"
                placeholder="(11) 99999-9999"
                error={errors.telefone?.message}
                {...register('telefone')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="drjoao@clinica.com.br"
                {...register('email')}
              />
            </div>

            <Input
              label="Valor da Consulta (R$) *"
              placeholder="200"
              type="number"
              error={errors.valor_consulta?.message}
              {...register('valor_consulta')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/medicos')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}