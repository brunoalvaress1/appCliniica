// src/pages/convenio/LoginConvenioPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function LoginConvenioPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleLogin = async () => {
    if (!email || !senha) {
      setError('Preencha email e senha')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const { data, error: err } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .in('tipo', ['convenio', 'particular'])
        .single()
      
      if (err || !data) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }
      
      localStorage.setItem('convenio_id', data.id)
      localStorage.setItem('convenio_nome', data.nome)
      localStorage.setItem('convenio_tipo', data.tipo)
      navigate('/convenio/agenda')
      
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Convênio</h1>
          <p className="text-gray-600">Acesso administrativo</p>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {mostrarSenha ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <Button onClick={handleLogin} className="w-full bg-teal-600" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Link to="/" className="block text-center text-gray-500">← Voltar</Link>
      </div>
    </div>
  )
}