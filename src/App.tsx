// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'

// Páginas públicas
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { CadastroPage } from './pages/auth/CadastroPage'

// Paciente
import { AgendamentoPage } from './pages/patient/AgendamentoPage'
import { PortalPacientePage } from './pages/patient/PortalPacientePage'

// Admin
import { StartPage } from './pages/admin/StartPage'
import { PacientesPage } from './pages/admin/PacientesPage'
import { NovoPacientePage } from './pages/admin/NovoPacientePage'
import { DetalhesPacientePage } from './pages/admin/DetalhesPacientePage'
import { EditarPacientePage } from './pages/admin/EditarPacientePage'
import { MedicosPage } from './pages/admin/MedicosPage'
import { NovoMedicoPage } from './pages/admin/NovoMedicoPage'
import { EditarMedicoPage } from './pages/admin/EditarMedicoPage'
import { AgendaPage } from './pages/admin/AgendaPage'
import { NovaConsultaPage } from './pages/admin/NovaConsultaPage'
import { DetalhesConsultaPage } from './pages/admin/DetalhesConsultaPage'
import { ProntuarioPage } from './pages/admin/ProntuarioPage'
import { ConveniosPage } from './pages/admin/ConveniosPage'
import { NovoConvenioPage } from './pages/admin/NovoConvenioPage'
import { FinanceiroPage } from './pages/admin/FinanceiroPage'
import { PerfilPage } from './pages/admin/PerfilPage'
import { BuscaPage } from './pages/admin/BuscaPage'

// Recepção
import { RecepcaoPage } from './pages/recepcao/RecepcaoPage'

// Convênio
import { LoginConvenioPage } from './pages/convenio/LoginConvenioPage'
import { AgendaConvenioPage } from './pages/convenio/AgendaConvenioPage'

// Médico (se existir) - caso contrário, criar
import { AgendaMedicoPage } from './pages/medico/AgendaMedicoPage'
import { LoginMedicoPage } from './pages/medico/LoginMedicoPage'

// Layout
import { Layout } from './components/layout/Layout'
import { Button } from './components/ui/Button'
import { Home } from 'lucide-react'

// 404
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">Página não encontrada</p>
        <div className="mt-8">
          <Link to="/"><Button><Home className="w-4 h-4 mr-2" />Início</Button></Link>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÚBLICAS */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastrar" element={<CadastroPage />} />
        <Route path="/agendar" element={<AgendamentoPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        
        {/* PACIENTE */}
        <Route path="/paciente" element={<PortalPacientePage />} />
        
        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute><Layout><StartPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/inicio" element={<ProtectedRoute><Layout><StartPage /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/pacientes" element={<ProtectedRoute><Layout><PacientesPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/pacientes/novo" element={<ProtectedRoute><Layout><NovoPacientePage /></Layout></ProtectedRoute>} />
        <Route path="/admin/pacientes/:id" element={<ProtectedRoute><Layout><DetalhesPacientePage /></Layout></ProtectedRoute>} />
        <Route path="/admin/pacientes/:id/editar" element={<ProtectedRoute><Layout><EditarPacientePage /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/medicos" element={<ProtectedRoute><Layout><MedicosPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/medicos/novo" element={<ProtectedRoute><Layout><NovoMedicoPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/medicos/:id/editar" element={<ProtectedRoute><Layout><EditarMedicoPage /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/agenda" element={<ProtectedRoute><Layout><AgendaPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/consultas/nova" element={<ProtectedRoute><Layout><NovaConsultaPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/consulta/:id" element={<ProtectedRoute><Layout><DetalhesConsultaPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/consulta/:id/prontuario" element={<ProtectedRoute><Layout><ProntuarioPage /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/convenios" element={<ProtectedRoute><Layout><ConveniosPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/convenios/novo" element={<ProtectedRoute><Layout><NovoConvenioPage /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/financeiro" element={<ProtectedRoute><Layout><FinanceiroPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/busca" element={<ProtectedRoute><Layout><BuscaPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/perfil" element={<ProtectedRoute><Layout><PerfilPage /></Layout></ProtectedRoute>} />
        
        {/* RECEPCÃO */}
        <Route path="/recepcao" element={<RecepcaoPage />} />
        
        {/* CONVÊNIO */}
        <Route path="/convenio/login" element={<LoginConvenioPage />} />
        <Route path="/convenio/agenda" element={<AgendaConvenioPage />} />
        
        {/* MÉDICO */}
        <Route path="/medico/login" element={<LoginMedicoPage />} />
        <Route path="/medico/agenda" element={<AgendaMedicoPage />} />
        
        {/* REDIRECT */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App