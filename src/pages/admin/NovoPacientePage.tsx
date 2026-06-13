// src/pages/admin/NovoPacientePage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const pacienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  data_nascimento: z.string().optional(),
  sexo: z.enum(['masculino', 'feminino']).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  whatsapp: z.string().optional(),
})

type PacienteForm = z.infer<typeof pacienteSchema>

export function NovoPacientePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
  })

  const onSubmit = async (data: PacienteForm) => {
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('pacientes')
        .insert({
          nome: data.nome,
          cpf: data.cpf,
          telefone: data.telefone,
          email: data.email || null,
          data_nascimento: data.data_nascimento || null,
          sexo: data.sexo || null,
          endereco: data.endereco || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          cep: data.cep || null,
          whatsapp: data.whatsapp || null,
        })

      if (insertError) throw insertError

      navigate('/admin/pacientes')
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/pacientes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-gray-600">Cadastrar novo paciente</p>
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
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo *"
                placeholder="João da Silva"
                error={errors.nome?.message}
                {...register('nome')}
              />
              <Input
                label="CPF *"
                placeholder="12345678900"
                error={errors.cpf?.message}
                {...register('cpf')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Telefone *"
                placeholder="(11) 99999-9999"
                error={errors.telefone?.message}
                {...register('telefone')}
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                {...register('whatsapp')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Data de Nascimento"
                type="date"
                {...register('data_nascimento')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sexo
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('sexo')}
                >
                  <option value="">Selecione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              {...register('email')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Endereço</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Endereço"
              placeholder="Rua, número, complemento"
              {...register('endereco')}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                placeholder="São Paulo"
                {...register('cidade')}
              />
              <Input
                label="Estado"
                placeholder="SP"
                {...register('estado')}
              />
              <Input
                label="CEP"
                placeholder="01234-567"
                {...register('cep')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/pacientes')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}