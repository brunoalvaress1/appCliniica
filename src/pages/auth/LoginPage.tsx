import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  
  const [dados, setDados] = useState({
    email: '',
    senha: '',
    nome: '',
    telefone: '',
    cpf: ''
  })

  // 🔐 LOGIN
  const fazerLogin = async () => {
    setErro('')
    
    if (!dados.email || !dados.senha) {
      setErro('Preencha Email e Senha!')
      return
    }

    setLoading(true)

    try {
      console.log('Procurando usuário com email:', dados.email)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', dados.email)
        .eq('senha', dados.senha)
        .single()

      console.log('Resultado:', data, error)

      if (error || !data) {
        setErro('Email ou Senha incorretos!')
        setLoading(false)
        return
      }

      // Salvar sessão
      localStorage.setItem('paciente_id', data.id)
      localStorage.setItem('paciente_nome', data.nome)
      localStorage.setItem('paciente_cpf', data.cpf)
      
      console.log('Redirecionando para /agendamento')
      
      // Redirecionar para agendamento
      navigate('/agendamento')
      
    } catch (err) {
      console.log('Erro:', err)
      setErro('Erro ao fazer login!')
    }

    setLoading(false)
  }

  // 📝 CADASTRAR
  const cadastrar = async () => {
    if (!dados.nome || !dados.cpf || !dados.telefone || !dados.email || !dados.senha) {
      setErro('Preencha todos os campos!')
      return
    }

    if (dados.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres!')
      return
    }

    setLoading(true)
    setErro('')

    try {
      // Verificar se CPF já existe
      const { data: existente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', dados.cpf)
        .single()

      if (existente) {
        setErro('CPF já cadastrado!')
        setLoading(false)
        return
      }

      // Criar usuário
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome: dados.nome,
          cpf: dados.cpf,
          telefone: dados.telefone,
          email: dados.email,
          senha: dados.senha,
          perfil: 'paciente'
        })

      if (error) {
        setErro('Erro ao cadastrar: ' + error.message)
        setLoading(false)
        return
      }

      alert('Cadastro realizado com sucesso!')
      navigate('/agendamento')
      
    } catch (err) {
      setErro('Erro ao cadastrar!')
    }

    setLoading(false)
  }

  const limparCampos = () => {
    setDados({ email: '', senha: '', nome: '', telefone: '', cpf: '' })
    setErro('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-blue-600">
            {modo === 'login' ? 'Login' : 'Criar Conta'}
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {modo === 'login' 
              ? 'Entre com seu email e senha' 
              : 'Preencha seus dados para se cadastrar'}
          </p>

          {erro && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center">
              {erro}
            </div>
          )}

          <div className="space-y-4">
            {modo === 'cadastro' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl"
                    value={dados.nome}
                    onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl"
                    value={dados.cpf}
                    onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl"
                    value={dados.telefone}
                    onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl"
                  value={dados.email}
                  onChange={(e) => setDados({ ...dados, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 rounded-xl"
                  value={dados.senha}
                  onChange={(e) => setDados({ ...dados, senha: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {mostrarSenha ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <Button
              onClick={modo === 'login' ? fazerLogin : cadastrar}
              disabled={loading}
              className="w-full bg-green-500 mt-4"
            >
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>

            <p className="text-center mt-4">
              {modo === 'login' ? (
                <>
                  Não tem conta?{' '}
                  <button onClick={() => { setModo('cadastro'); limparCampos() }} className="text-blue-600 font-medium">
                    Criar conta
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button onClick={() => { setModo('login'); limparCampos() }} className="text-blue-600 font-medium">
                    Fazer login
                  </button>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}