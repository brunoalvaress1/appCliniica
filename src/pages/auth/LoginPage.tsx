import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Button } from '../../components/ui/Card'
import { User, Lock, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [dados, setDados] = useState({
    email: '',
    senha: '',
    nome: ''
  })

  // LOGIN com Supabase Auth
  const fazerLogin = async () => {
    if (!dados.email || !dados.senha) {
      alert('Preencha email e senha!')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha
    })

    if (error) {
      alert('Erro: ' + error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      localStorage.setItem('paciente_id', data.user.id)
      localStorage.setItem('paciente_email', data.user.email || '')
      navigate('/agendamento')
    }

    setLoading(false)
  }

  // CADASTRAR com Supabase Auth
  const cadastrar = async () => {
    if (!dados.email || !dados.senha || !dados.nome) {
      alert('Preencha todos os campos!')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome
        }
      }
    })

    if (error) {
      alert('Erro: ' + error.message)
      setLoading(false)
      return
    }

    alert('Conta criada! Verifique seu email.')
    setIsLogin(true)
    setLoading(false)
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
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full p-3 mb-4 bg-gray-50 rounded-xl"
              value={dados.nome}
              onChange={(e) => setDados({...dados, nome: e.target.value})}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 bg-gray-50 rounded-xl"
            value={dados.email}
            onChange={(e) => setDados({...dados, email: e.target.value})}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 mb-4 bg-gray-50 rounded-xl"
            value={dados.senha}
            onChange={(e) => setDados({...dados, senha: e.target.value})}
          />

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
                <button onClick={() => setIsLogin(false)} className="text-blue-600">
                  Criar
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => setIsLogin(true)} className="text-blue-600">
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