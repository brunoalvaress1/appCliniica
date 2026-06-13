// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { 
  Stethoscope, Calendar, Clock, User, Phone, Mail, 
  MapPin, ArrowRight, CheckCircle, Building2, 
  Award, Mic, Activity
} from 'lucide-react'

export function LandingPage() {
  const telefone = '(19) 3571-3126'
  const whatsapp = '19999999999'
  const endereco = 'R. Joaquim Mourão, 830 - Centro, Leme - SP'
  
  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Clínica Musumeci</span>
                <span className="text-xs text-gray-500 block -mt-1">Otorrinolaringologia</span>
              </div>
            </Link>

            {/* Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#servicos" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Serviços</a>
              <a href="#sobre" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">A Clínica</a>
              <a href="#contato" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Contato</a>
            </nav>

            {/* Botões */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Área do Paciente</Button>
              </Link>
              <Link to="/agendar">
                <Button className="bg-teal-600 hover:bg-teal-700">Agendar Consulta</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-6">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Otorrinolaringologia em Leme</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Cuidando da sua 
                <span className="text-teal-600"> saúde auditiva</span> e respiratória
              </h1>
              <p className="text-xl text-gray-600 mt-6 max-w-lg mx-auto lg:mx-0">
                Especialistas em otorrino em Leme-SP. Atendimento humanizado 
                para toda a família com excelência e cuidado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
                <Link to="/agendar">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Consulta
                  </Button>
                </Link>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-teal-600 text-teal-600 hover:bg-teal-50">
                    <Phone className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
              
              {/* Informações rápidas */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t">
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-teal-600">{telefone}</p>
                  <p className="text-sm text-gray-500">Telefone</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-teal-600">Leme</p>
                  <p className="text-sm text-gray-500">Localização</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-3xl font-bold text-teal-600">+5000</p>
                  <p className="text-sm text-gray-500">Pacientes</p>
                </div>
              </div>
            </div>

            {/* Imagem */}
            <div className="relative">
              <div className="aspect-square max-w-lg mx-auto">
                <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-50 rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Clínica Musumeci</p>
                    <p className="text-teal-600 font-medium">Otorrinolaringologia</p>
                  </div>
                </div>
              </div>
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-400 rounded-full opacity-20" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-600 rounded-full opacity-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SESSÃO ESPECIALIDADES ==================== */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Nossas Especialidades
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Atendimento completo em otorrinolaringologia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Audiologia', 
                desc: 'Avaliação e tratamento de problemas auditivos, testes de audição e adaptação de aparelhos' 
              },
              { 
                title: 'Rinite e Sinusite', 
                desc: 'Diagnóstico e tratamento de alergias respiratórias e sinusite' 
              },
              { 
                title: 'Apneia do Sono', 
                desc: 'Investigação e tratamento de distúrbios do sono' 
              },
              { 
                title: 'Zumbido', 
                desc: 'Avaliação e manejo do zumbido e alterações vestibulares' 
              },
              { 
                title: 'Disfonia', 
                desc: 'Tratamento de problemas vocais e rouquidão' 
              },
              { 
                title: 'Cirurgias', 
                desc: 'Realização de procedimentos cirúrgicos otorrinolaringológicos' 
              },
            ].map((servico, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-teal-600">
                <h3 className="text-lg font-semibold text-gray-900">{servico.title}</h3>
                <p className="text-gray-600 mt-2">{servico.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SESSÃO sobre ==================== */}
      <section id="sobre" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Clínica Musumeci
              </h2>
              <p className="text-lg text-teal-600 font-medium mt-2">
                Referência em Otorrinolaringologia em Leme
              </p>
              <p className="text-gray-600 mt-4">
                Há mais de 15 anos atendendo a população de Leme e região com 
                excelência em otorrinolaringologia. Nossa equipe é altamente qualific  
                e utilizando equipamentos de última geração para oferecer o melhor 
                atendimento aos nossos pacientes.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Equipe médica especializada',
                  'Equipamentos modernos',
                  'Atendimento humanizado',
                  'Horário flexível',
                  'Convênios credenciados',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/agendar" className="inline-flex">
                <Button size="lg" className="mt-8 bg-teal-600 hover:bg-teal-700">
                  Agendar Consulta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Cards de diferenciais */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, title: '+15 Anos', desc: 'de experiência' },
                { icon: User, title: '+5000', desc: 'pacientes atendidos' },
                { icon: Stethoscope, title: 'Especialistas', desc: 'em otorrino' },
                { icon: Building2, title: 'Estrutura', desc: 'moderna' },
              ].map((item, i) => (
                <div key={i} className="bg-teal-50 p-6 rounded-2xl">
                  <item.icon className="w-8 h-8 text-teal-600 mb-3" />
                  <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTATO ==================== */}
      <section id="contato" className="py-20 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Pronto para melhorar sua qualidade de vida?
          </h2>
          <p className="text-xl text-teal-100 mt-4 max-w-2xl mx-auto">
            Agende sua consulta agora mesmo. Nossa equipe está pronta para atender você.
          </p>
          
          <div className="bg-white rounded-2xl p-6 mt-8 max-w-md mx-auto">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Endereço</p>
                  <p className="text-gray-600">{endereco}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Telefone</p>
                  <p className="text-gray-600">{telefone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link to="/agendar">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Consulta
              </Button>
            </Link>
            <a href={`tel:${telefone.replace(/\D/g, '')}`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                <Phone className="w-5 h-5 mr-2" />
                Ligar Agora
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      {/* RODAPÉ */}
<footer className="bg-gray-800 text-white py-8 mt-auto">
  <div className="container mx-auto px-4">
    <h3 className="text-lg font-bold mb-4 text-center">Acessos Rápidos</h3>
    
    <div className="grid grid-cols-2 gap-4 text-center">
      <a href="/admin/LogsPage" className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
        <p className="font-bold">Admin</p>
        <p className="text-xs text-gray-400">Painel administrativo</p>
      </a>
      
      <a href="/medico/LoginMedicoPage" className="p-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
        <p className="font-bold">Médico</p>
        <p className="text-xs text-blue-200">Agenda médica</p>
      </a>
      
      <a href="/recepcao/RecepcaoPage" className="p-3 bg-green-600 rounded-lg hover:bg-green-500 transition">
        <p className="font-bold">Recepção</p>
        <p className="text-xs text-green-200">Atendimento</p>
      </a>
      
      <a href="/convenio/LoginConvenioPage" className="p-3 bg-purple-600 rounded-lg hover:bg-purple-500 transition">
        <p className="font-bold">Convênio</p>
        <p className="text-xs text-purple-200">Área conveniada</p>
      </a>
    </div>
    
    <div className="text-center mt-8 text-gray-400 text-sm">
      <p>© 2024 Clínica App - Todos os direitos reservados</p>
    </div>
  </div>
</footer>
    </div>
  )
}