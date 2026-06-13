// src/pages/auth/CadastroPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { Stethoscope, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const cadastroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não conferem',
  path: ['confirmarSenha'],
})

type CadastroForm = z.infer<typeof cadastroSchema>

export function CadastroPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  const onSubmit = async (data: CadastroForm) => {
    setLoading(true)
    setError('')

    try {
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      })

      if (authError) throw authError

      if (authData.user) {
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            perfil: 'paciente',
          })

        if (profileError) throw profileError
      }

      alert('Cadastro realizado com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Clínica Saúde</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Preencha seus dados para se cadastrar
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome Completo"
                type="text"
                placeholder="Seu nome completo"
                icon={<User className="w-5 h-5" />}
                error={errors.nome?.message}
                {...register('nome')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                icon={<Phone className="w-5 h-5" />}
                error={errors.telefone?.message}
                {...register('telefone')}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.senha?.message}
                  {...register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Input
                label="Confirmar Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                error={errors.confirmarSenha?.message}
                {...register('confirmarSenha')}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-gray-500 text-sm">
          <Link to="/" className="hover:text-gray-700">
            ← Voltar para página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}