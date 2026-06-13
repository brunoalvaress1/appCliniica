// src/types/index.ts

export interface User {
  id: string
  email: string
  nome: string
  perfil: 'admin' | 'medico' | 'recepcionista' | 'paciente'
  created_at: string
}

export interface Medico {
  id: string
  nome: string
  crm: string
  especialidade: string
  telefone: string
  email: string
  valor_consulta: number
  foto_url?: string
  ativo: boolean
  created_at: string
}

export interface Paciente {
  id: string
  nome: string
  cpf: string
  rg?: string
  data_nascimento: string
  sexo: 'masculino' | 'feminino'
  telefone: string
  whatsapp: string
  email?: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  convenio_id?: string
  numero_carteirinha?: string
  observacoes?: string
  created_at: string
}

export interface Consulta {
  id: string
  paciente_id: string
  medico_id: string
  data: string
  hora: string
  tipo: 'particular' | 'convenio'
  status: 'agendada' | 'confirmada' | 'aguardando' | 'em_atendimento' | 'finalizada' | 'cancelada'
  valor: number
  observacoes?: string
  created_at: string
}

export interface Convênio {
  id: string
  nome_fantasia: string
  razao_social: string
  cnpj: string
  telefone: string
  email: string
  logo_url?: string
  ativo: boolean
  created_at: string
}

export interface Perfil {
  id: string
  nome: string
  descricao?: string
  permissoes: Permissao[]
  created_at: string
}

export interface Permissao {
  recurso: string
  visualizar: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
}

export interface Especialidade {
  id: string
  nome: string
  icone: string
}

export const ESPECIALIDADES: Especialidade[] = [
  { id: 'otorrino', nome: 'Otorrinolaringologia', icone: 'Ear' },
  { id: 'plastica', nome: 'Cirurgia Plástica', icone: 'Scissors' },
  { id: 'clinico', nome: 'Clínico Geral', icone: 'Stethoscope' },
]