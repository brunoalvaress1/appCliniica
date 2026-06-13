import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mail, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [dados, setDados] = useState({
    email: '',
    senha: '',
    nome: '',
    cpf: '',
    telefone: ''
  })

  // LOGIN com tabela usuarios
  const fazerLogin = async () => {
    if (!dados.email || !dados.senha) {
      alert('Preencha email e senha!')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', dados.email)
      .eq('senha', dados.senha)
      .single()

    if (error || !data) {
      alert('Email ou senha incorretos!')
      setLoading(false)
      return
    }

    // Salvar sessão
    localStorage.setItem('paciente_id', data.id)
    localStorage.setItem('paciente_nome', data.nome)
    localStorage.setItem('paciente_cpf', data.cpf)
    localStorage.setItem('paciente_email', data.email)
    
    navigate('/agendamento')
    setLoading(false)
  }

  // CADASTRAR na tabela usuarios
  const cadastrar = async () => {
    if (!dados.nome || !dados.cpf || !dados.telefone || !dados.email || !dados.senha) {
      alert('Preencha todos os campos!')
      return
    }

    setLoading(true)

    // Verificar se email já existe
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', dados.email)
      .single()

    if (existente) {
      alert('Email já cadastrado!')
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
      alert('Erro ao cadastrar: ' + error.message)
      setLoading(false)
      return
    }

    alert('Conta criada com sucesso!')
    
    // Fazer login automático
    navigate('/agendamento')
    setLoading(false)
  }

  const limparCampos = () => {
    setDados({ email: '', senha: '', nome: '', cpf: '', telefone: '' })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-2 text-blue-600">
            {isLogin ? 'Login' : 'Criar Conta'}
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {isLogin ? 'Entre com email e senha' : 'Cadastre-se'}
          </p>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full p-3 mb-3 bg-gray-50 rounded-xl"
                value={dados.nome}
                onChange={(e) => setDados({...dados, nome: e.target.value})}
              />
              <input
                type="text"
                placeholder="CPF"
                className="w-full p-3 mb-3 bg-gray-50 rounded-xl"
                value={dados.cpf}
                onChange={(e) => setDados({...dados, cpf: e.target.value})}
              />
              <input
                type="text"
                placeholder="Telefone"
                className="w-full p-3 mb-3 bg-gray-50 rounded-xl"
                value={dados.telefone}
                onChange={(e) => setDados({...dados, telefone: e.target.value})}
              />
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-3 mb-3 bg-gray-50 rounded-xl"
              value={dados.email}
              onChange={(e) => setDados({...dados, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Senha"
              className="w-full pl-10 p-3 mb-4 bg-gray-50 rounded-xl"
              value={dados.senha}
              onChange={(e) => setDados({...dados, senha: e.target.value})}
            />
          </div>

          <Button
            onClick={isLogin ? fazerLogin : cadastrar}
            disabled={loading}
            className="w-full bg-green-500"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>

          <p className="text-center mt-4">
            {isLogin ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => {setIsLogin(false); limparCampos()}} className="text-blue-600 font-medium">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => {setIsLogin(true); limparCampos()}} className="text-blue-600 font-medium">
                  Login
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}