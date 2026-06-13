// src/pages/admin/TermosPage.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface Termo {
  id: string
  titulo: string
  conteudo: string
  tipo: 'consentimento' | 'termo' | 'contrato'
}

const termos: Termo[] = [
  {
    id: '1',
    titulo: 'Termo de Consentimento Livre e Esclarecido',
    tipo: 'consentimento',
    conteudo: `
TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO

Eu, paciente, declaro que fui informado(a) sobre o procedimentos a ser realizado, seus benefícios, riscos e alternativas.

Declaro que tive a oportunidade de esclarecer todas as minhas dúvidas.

Estou ciente de que posso revogar este consentimento a qualquer momento.

Data: _____/_____/_________
Assinatura: ___________________________
    `,
  },
  {
    id: '2',
    titulo: 'Termo de Uso de Dados',
    tipo: 'termo',
    conteudo: `
TERMO DE USO DE DADOS PESSOAIS

Autorizo a utilização dos meus dados pessoais para fins de atendimento médico e administrativo.

Os dados serão armazenados de forma segura e não serão compartilhados com terceiros sem minha autorização expressa.

Posso solicitar a exclusão dos meus dados a qualquer momento.

Data: _____/_____/_________
Assinatura: ___________________________
    `,
  },
  {
    id: '3',
    titulo: 'Acordo de Pagamento',
    tipo: 'contrato',
    conteudo: `
ACORDO DE PAGAMENTO

O paciente compromete-se a pagar pelos serviços médicos conforme combinado:

Forma de pagamento: [ ] À vista [ ] Parcelado
Valor: R$ ________________

Em caso de atraso, será cobrada multa de 10% + juros de 1% ao mês.

Data: _____/_____/_________
Assinatura: ___________________________
    `,
  },
]

export function TermosPage() {
  const [selecionado, setSelecionado] = useState<Termo | null>(null)

  const downloadTermo = (termo: Termo) => {
    // Criar arquivo de texto
    const blob = new Blob([termo.conteudo], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${termo.titulo.toLowerCase().replace(/ /g, '_')}.txt`
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Termos e Contratos</h1>
        <p className="text-gray-600">Modelos para impressão</p>
      </div>

      {!selecionado ? (
        <div className="grid md:grid-cols-3 gap-4">
          {termos.map((termo) => (
            <Card key={termo.id} className="cursor-pointer hover:border-blue-300" onClick={() => setSelecionado(termo)}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium">{termo.titulo}</p>
                <p className="text-sm text-gray-500 mt-1 capitalize">{termo.tipo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selecionado.titulo}</h2>
              <p className="text-sm text-gray-500 capitalize">{selecionado.tipo}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelecionado(null)}>
                Voltar
              </Button>
              <Button onClick={() => downloadTermo(selecionado)}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-lg border">
{selecionado.conteudo}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}