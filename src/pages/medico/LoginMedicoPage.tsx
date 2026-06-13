// src/pages/medico/LoginMedicoPage.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Stethoscope, Mail, Lock, Eye, EyeOff, 
  Phone, MapPin, Clock, AlertCircle, CheckCircle,
  Heart, Activity, Brain, Bone
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function LoginMedicoPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [lembrar, setLembrar] = useState(false)

  // Lista de médicos para seleção rápida
  const [medicos, setMedicos] = useState<any[]>([])
  const [medicoSelecionado, setMedicoSelecionado] = useState<any>(null)

  useEffect(() => {
    buscarMedicos()
    // Verificar se já está logado
    const medicoId = localStorage.getItem('medico_id')
    if (medicoId) {
      navigate('/medico/agenda')
    }
  }, [])

  const buscarMedicos = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'medico')
      .eq('ativo', true)
      .order('nome')
    
    if (data) setMedicos(data)
  }

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
        .eq('tipo', 'medico')
        .single()
      
      if (err || !data) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }
      
      if (data.ativo === false) {
        setError('Médico inativo. Entre em contato.')
        setLoading(false)
        return
      }
      
      // Salvar dados do médico
      localStorage.setItem('medico_id', data.id)
      localStorage.setItem('medico_nome', data.nome)
      localStorage.setItem('medico_email', data.email)
      
      navigate('/medico/agenda')
      
    } catch (err: any) {
      setError('Erro ao fazer login')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (medico: any) => {
    localStorage.setItem('medico_id', medico.id)
    localStorage.setItem('medico_nome', medico.nome)
    localStorage.setItem('medico_email', medico.email)
    navigate('/medico/agenda')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex">
      {/* Lado Esquerdo - Informações */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Clínica Musumeci</h1>
              <p className="text-blue-200 text-sm">Sistema de Gestão</p>
            </div>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Área do<br /><span className="text-blue-300">Médico</span>
            </h2>
            <p className="text-blue-200 text-lg mt-4">
              Acesse sua agenda de consultas, gerencie pacientes e acompanhe seu histórico.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Calendar className="w-8 h-8 text-blue-300 mb-2" />
              <p className="text-white font-medium">Agenda Online</p>
              <p className="text-blue-200 text-sm">Gerencie suas consultas</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Activity className="w-8 h-8 text-blue-300 mb-2" />
              <p className="text-white font-medium">Prontuário</p>
              <p className="text-blue-200 text-sm">Histórico completo</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Brain className="w-8 h-8 text-blue-300 mb-2" />
              <p className="text-white font-medium">Atendimentos</p>
              <p className="text-blue-200 text-sm">Acompanhe evolução</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <Heart className="w-8 h-8 text-blue-300 mb-2" />
              <p className="text-white font-medium">Financeiro</p>
              <p className="text-blue-200 text-sm">Controle de receitas</p>
            </div>
          </div>
        </div>

        <div className="text-blue-200 text-sm">
          <p>© 2024 Clínica Musumeci. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Lado Direito - Login */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Mobile */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Musumeci</h1>
              <p className="text-gray-500 text-sm">Área do Médico</p>
            </div>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Olá, Dr(a)!</h1>
            <p className="text-gray-600 mt-2">Faça login para continuar</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/*快速登录 - Lista de médicos */}
          {medicos.length > 0 && !email && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">Ou selecione um médico:</p>
              <div className="space-y-2 max-h-48 overflow-auto">
                {medicos.map((medico) => (
                  <button
                    key={medico.id}
                    onClick={() => handleQuickLogin(medico)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {medico.nome?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{medico.nome}</p>
                      <p className="text-sm text-gray-500">{medico.email}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">ou faça login manualmente abaixo</p>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="seu.email@medico.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Lembrar acesso</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-gray-500 text-sm">ou</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <Link 
              to="/login" 
              className="block text-center text-gray-600 hover:text-gray-900"
            >
              Acessar como administrador
            </Link>
          </form>

          <Link to="/" className="block text-center text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}