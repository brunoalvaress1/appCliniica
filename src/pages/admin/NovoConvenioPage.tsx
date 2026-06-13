// src/pages/admin/NovoConvenioPage.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const convenioSchema = z.object({
  nome_fantasia: z.string().min(3, 'Nome é obrigatório'),
  razao_social: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  valor_consulta: z.string().min(1, 'Valor é obrigatória'),
  valor_retorno: z.string().optional(),
  bloqueia_mananha: z.boolean().optional(),
  bloqueia_tarde: z.boolean().optional(),
  bloqueia_sexta: z.boolean().optional(),
  limite_diario: z.string().optional(),
})

type ConvenioForm = z.infer<typeof convenienteSchema>

export function NovoConvenioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!id

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ConvenioForm>({
    resolver: zodResolver(convenioSchema),
  })

  useState(() => {
    if (id) buscarConvenio()
  })

  const buscarConvenio = async () => {
    const { data } = await supabase
      .from('convenios')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) reset(data)
  }

  const onSubmit = async (data: ConvenioForm) => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        nome_fantasia: data.nome_fantasia,
        razao_social: data.razao_social || null,
        cnpj: data.cnpj || null,
        telefone: data.telefone || null,
        email: data.email || null,
        valor_consulta: parseFloat(data.valor_consulta),
        valor_retorno: data.valor_retorno ? parseFloat(data.valor_retorno) : null,
        bloqueia_mananha: data.bloqueia_mananha || false,
        bloqueia_tarde: data.bloqueia_tarde || false,
        bloqueia_sexta: data.bloqueia_sexta || false,
        limite_diario: data.limite_diario ? parseInt(data.limite_diario) : 999,
        ativo: true,
      }

      if (isEditing) {
        await supabase.from('convenios').update(payload).eq('id', id)
      } else {
        await supabase.from('convenios').insert(payload)
      }

      navigate('/admin/convenios')
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar convênio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/convenios')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Convênio' : 'Novo Convênio'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Editar convênio' : 'Cadastrar novo convênio'}
          </p>
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
            <h2 className="text-lg font-semibold">Dados do Convênio</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome Fantasia *"
              placeholder="Santa Casa"
              error={errors.nome_fantasia?.message}
              {...register('nome_fantasia')}
            />
            <Input
              label="Razão Social"
              placeholder="Santa Casa Ltda"
              {...register('razao_social')}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="CNPJ"
                placeholder="12.345.678/0001-90"
                {...register('cnpj')}
              />
              <Input
                label="Telefone"
                placeholder="(11) 3333-4444"
                {...register('telefone')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="contato@convenio.com.br"
              {...register('email')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Valores</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Valor Consulta (R$) *"
                placeholder="150"
                type="number"
                error={errors.valor_consulta?.message}
                {...register('valor_consulta')}
              />
              <Input
                label="Valor Retorno (R$)"
                placeholder="75"
                type="number"
                {...register('valor_retorno')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Restrições</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('bloqueia_mananha')} />
                <span>Bloquear horários da manhã</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('bloqueia_tarde')} />
                <span>Bloquear horários da tarde</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('bloqueia_sexta')} />
                <span>Bloquear sextas-feiras</span>
              </label>
            </div>
            <Input
              label="Limite diário de consultas"
              placeholder="10"
              type="number"
              {...register('limite_diario')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/convenios')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Convênio'}
          </Button>
        </div>
      </form>
    </div>
  )
}