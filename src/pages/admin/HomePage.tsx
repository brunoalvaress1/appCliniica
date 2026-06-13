// src/pages/admin/HomePage.tsx
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  Users, Calendar, User, ClipboardList, 
  CreditCard, BarChart3, Building2, Settings,
  ArrowRight
} from 'lucide-react'

export function HomePage() {
  const menuItems = [
    { icon: Users, label: 'Pacientes', path: '/admin/pacientes', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Agenda', path: '/admin/agenda', color: 'bg-green-500' },
    { icon: User, label: 'Médicos', path: '/admin/medicos', color: 'bg-pink-500' },
    { icon: ClipboardList, label: 'Consultas', path: '/admin/consultas/nova', color: 'bg-purple-500' },
    { icon: Building2, label: 'Convênios', path: '/admin/convenios', color: 'bg-yellow-500' },
    { icon: CreditCard, label: 'Financeiro', path: '/admin/financeiro', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios', color: 'bg-indigo-500' },
    { icon: Settings, label: 'Configurações', path: '/admin/config', color: 'bg-gray-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo!</h1>
        <p className="text-gray-600">Escolha uma opção para continuar</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="hover:border-blue-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-medium">{item.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}