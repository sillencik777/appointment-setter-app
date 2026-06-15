'use client'
import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Closer Metrics CRM</h1>
          <p className="text-indigo-200 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Iniciar Sesión
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Primera vez?{' '}
            <Link href="/register" className="text-indigo-600 font-medium">
              Crear cuenta
            </Link>
          </p>
        </div>

        <p className="text-center text-indigo-200 text-xs mt-6">
          © 2024 Closer Metrics CRM · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
