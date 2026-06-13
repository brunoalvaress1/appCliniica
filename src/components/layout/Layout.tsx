// src/components/layout/Layout.tsx
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { 
  Stethoscope, Home, Users, Calendar, User, 
  CreditCard, Settings, LogOut, Menu, X,
  ClipboardList, BarChart3, Search, Building2,
  Download, CheckSquare, Bell, DollarSign,
  Mail, FileText, CalendarOff, Activity
} from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'

const menuItems = [
  { icon: Search, label: 'Buscar', path: '/admin/busca' },
  { icon: Home, label: 'Início', path: '/admin/inicio' },
  { icon: Users, label: 'Pacientes', path: '/admin/pacientes' },
  { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
  { icon: User, label: 'Médicos', path: '/admin/medicos' },
  { icon: ClipboardList, label: 'Consultas', path: '/admin/consultas/nova' },
  { icon: Building2, label: 'Convênios', path: '/admin/convenios' },
  { icon: CreditCard, label: 'Financeiro', path: '/admin/financeiro' },
  { icon: DollarSign, label: 'Caixa', path: '/admin/caixa' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/relatorios' },
  { icon: Download, label: 'Exportar', path: '/admin/exportar' },
  { icon: CheckSquare, label: 'Tarefas', path: '/admin/tarefas' },
  { icon: Bell, label: 'Avisos', path: '/admin/avisos' },
  { icon: Mail, label: 'Mensagens', path: '/admin/mensagens' },
  { icon: FileText, label: 'Termos', path: '/admin/termos' },
  { icon: CalendarOff, label: 'Feriados', path: '/admin/feriados' },
  { icon: Activity, label: 'Logs', path: '/admin/logs' },
  { icon: Settings, label: 'Configurações', path: '/admin/config' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r fixed h-full">
        <div className="p-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Clínica</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t space-y-2">
          <Link to="/medico" className="block">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Área Médico
            </Button>
          </Link>
          <Link to="/admin/perfil" className="block">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Perfil
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Clínica</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="lg:hidden bg-white border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            </Link>
            <button onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}