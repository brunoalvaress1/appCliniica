// src/pages/admin/BuscaPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Search, User, Calendar, UserCheck, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function BuscaPage() {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState({
    pacientes: [] as any[],
    medicos: [] as any[],
    consultas: [] as any[],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (busca.length >= 3) {
      buscar()
    } else {
      setResultados({ pacientes: [], medicos: [], consultas: [] })
    }
  }, [busca])

  const buscar = async () => {
    setLoading(true)
    
    const [pacientes, medicos, consultas] = await Promise.all([
      supabase.from('pacientes').select('*').or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`).limit(5),
      supabase.from('medicos').select('*').or(`nome.ilike.%${busca}%,crm.ilike.%${busca}%`).limit(5),
      supabase.from('consultas')
        .select('*, paciente:pacientes(nome), medico:medicos(nome)')
        .or(`paciente.pacientes.nome.ilike.%${busca}%`)
        .limit(5),
    ])
    
    setResultados({
      pacientes: pacientes.data || [],
      medicos: medicos.data || [],
      consultas: consultas.data || [],
    })
    
    setLoading(false)
  }

  const temResultados = resultados.pacientes.length > 0 || 
                       resultados.medicos.length > 0 || 
                       resultados.consultas.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Busca Global</h1>
        <p className="text-gray-600">Buscar pacientes, médicos e consultas</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome, CPF, CRM..."
          className="pl-10 text-lg py-4"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-500">Buscando...</div>
      )}

      {!loading && busca.length >= 3 && !temResultados && (
        <div className="p-8 text-center text-gray-500">
          Nenhum resultado encontrado
        </div>
      )}

      {!loading && temResultados && (
        <div className="space-y-4">
          {/* Pacientes */}
          {resultados.pacientes.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Pacientes ({resultados.pacientes.length})</span>
                </div>
                <div className="divide-y">
                  {resultados.pacientes.map((paciente) => (
                    <Link
                      key={paciente.id}
                      to={`/admin/pacientes/${paciente.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{paciente.nome}</p>
                        <p className="text-sm text-gray-500">CPF: {paciente.cpf}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Médicos */}
          {resultados.medicos.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-medium">Médicos ({resultados.medicos.length})</span>
                </div>
                <div className="divide-y">
                  {resultados.medicos.map((medico) => (
                    <Link
                      key={medico.id}
                      to={`/admin/medicos/${medico.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      <UserCheck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{medico.nome}</p>
                        <p className="text-sm text-gray-500">{medico.especialidade} - CRM: {medico.crm}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultas */}
          {resultados.consultas.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Consultas ({resultados.consultas.length})</span>
                </div>
                <div className="divide-y">
                  {resultados.consultas.map((consulta) => (
                    <Link
                      key={consulta.id}
                      to={`/admin/consulta/${consulta.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{consulta.paciente?.nome}</p>
                        <p className="text-sm text-gray-500">
                          {consulta.data} às {consulta.hora} - {consulta.medico?.nome}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}