// src/pages/404.tsx
import { Link } from 'react-router-dom'
import { Button } from './components/ui/Button'
import { Home, Search } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">
          Página não encontrada
        </p>
        <p className="text-gray-600 mt-2">
          A página que você procura não existe.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}