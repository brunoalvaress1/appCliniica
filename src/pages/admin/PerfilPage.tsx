// src/pages/admin/PerfilPage.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../stores/useAuthStore'
import { Save, User, Mail, Phone, Shield } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function PerfilPage() {
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [dados, setDados] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
  })
  const [novaSenha, setNovaSenha] = useState('')

  const handleSalvar = async () => {
    setLoading(true)
    
    // Atualizar no banco
    if (user?.id) {
      await supabase
        .from('usuarios')
        .update({
          nome: dados.nome,
          telefone: dados.telefone,
        })
        .eq('id', user.id)
    }
    
    // Se quiser mudar senha
    if (novaSenha) {
      await supabase.auth.updateUser({ password: novaSenha })
    }
    
    setLoading(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerenciar informações da conta</p>
      </div>

      {salvo && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Perfil atualizado com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome"
            value={dados.nome}
            onChange={(e) => setDados({ ...dados, nome: e.target.value })}
          />
          <Input
            label="Email"
            value={dados.email}
            disabled
            icon={<Mail className="w-5 h-5" />}
          />
          <Input
            label="Telefone"
            value={dados.telefone}
            onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
            icon={<Phone className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Segurança
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nova Senha"
            type="password"
            placeholder="••••••••"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Deixe em branco para manter a senha atual.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="danger" onClick={handleLogout}>
          Sair da Conta
        </Button>
        <Button onClick={handleSalvar} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}