// src/pages/admin/PacientesPage.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { 
  Users, Search, Plus, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import type { Paciente } from '../../types'

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0 })
  const porPagina = 10

  useEffect(() => {
    buscarPacientes()
  }, [busca, pagination.page])

  const buscarPacientes = async () => {
    setLoading(true)
    
    let query = supabase
      .from('pacientes')
      .select('*', { count: 'exact' })
      .order('nome')
    
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`)
    }
    
    const from = (pagination.page - 1) * porPagina
    const to = from + porPagina - 1
    query = query.range(from, to)
    
    const { data, count } = await query
    
    setPacientes(data || [])
    setPagination(prev => ({ ...prev, total: count || 0 }))
    setLoading(false)
  }

  const totalPaginas = Math.ceil(pagination.total / porPagina)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">{pagination.total} pacientes cadastrados</p>
        </div>
        <Link to="/admin/pacientes/novo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              className="pl-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : pacientes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum paciente encontrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {pacientes.map((paciente) => (
                <Link
                  key={paciente.id}
                  to={`/admin/pacientes/${paciente.id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{paciente.nome}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>CPF: {paciente.cpf}</span>
                      {paciente.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {paciente.telefone}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {pagination.page} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === totalPaginas}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}