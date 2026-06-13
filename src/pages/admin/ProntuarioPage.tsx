// src/pages/admin/ProntuarioPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ArrowLeft, Save, FileText, Pill, TestTube, Clipboard } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function ProntuarioPage() {
  const { id } = useParams() // ID da consulta
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [consulta, setConsulta] = useState<any>(null)
  const [dados, setDados] = useState({
    anotacoes: '',
    diagnostico: '',
    cid: '',
    prescricao: '',
    exames_solicitados: '',
  })

  useEffect(() => {
    if (id) buscarDados()
  }, [id])

  const buscarDados = async () => {
    const { data } = await supabase
      .from('consultas')
      .select('*, paciente:pacientes(nome), medico:medicos(nome)')
      .eq('id', id)
      .single()
    
    if (data) {
      setConsulta(data)
      
      // Buscar prontuário existente
      const { data: prontuario } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('consulta_id', id)
        .single()
      
      if (prontuario) {
        setDados({
          anotacoes: prontuario.anotacoes || '',
          diagnostico: prontuario.diagnostico || '',
          cid: prontuario.cid || '',
          prescricao: prontuario.prescricao || '',
          exames_solicitados: prontuario.exames_solicitados || '',
        })
      }
    }
  }

  const handleSalvar = async () => {
    setLoading(true)
    
    await supabase
      .from('prontuarios')
      .upsert({
        consulta_id: id,
        paciente_id: consulta?.paciente_id,
        ...dados,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'consulta_id' })
    
    // Atualizar status da consulta
    await supabase
      .from('consultas')
      .update({ status: 'finalizada' })
      .eq('id', id)
    
    setLoading(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  if (!consulta) return <div className="p-8 text-center">Carregando...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/admin/consulta/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
          <p className="text-gray-600">
            {consulta.paciente?.nome} - {consulta.medico?.nome}
          </p>
        </div>
      </div>

      {salvo && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Prontuário salvo com sucesso!
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            Anotações da Consulta
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Queixa Principal / Anotações
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Descreva os sintomas e observações..."
              value={dados.anotacoes}
              onChange={(e) => setDados({ ...dados, anotacoes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Diagnóstico
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Diagnóstico"
            placeholder="Diagnóstico clínica"
            value={dados.diagnostico}
            onChange={(e) => setDados({ ...dados, diagnostico: e.target.value })}
          />
          <Input
            label="CID (Código Internacional de Doenças)"
            placeholder="A00 - Cólera"
            value={dados.cid}
            onChange={(e) => setDados({ ...dados, cid: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Prescrição
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Prescrição de Medicamentos
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
              placeholder="Ex:
              - Dipirona 500mg - 1 comprimido de 6 em 6 horas
              - Ibuprofeno 600mg - 1 comprimido после as refeições"
              value={dados.prescricao}
              onChange={(e) => setDados({ ...dados, prescricao: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Exames Solicitados
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Exames
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Liste os exames solicitados..."
              value={dados.exames_solicitados}
              onChange={(e) => setDados({ ...dados, exames_solicitados: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(`/admin/consulta/${id}`)}>
          Cancelar
        </Button>
        <Button onClick={handleSalvar} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Prontuário'}
        </Button>
      </div>
    </div>
  )
}