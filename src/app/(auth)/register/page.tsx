'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, role: 'ADMIN' }),
      })
      localStorage.setItem('token', res.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl backdrop-blur mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-indigo-200 text-sm mt-1">Configura tu Closer Metrics CRM</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                placeholder="Juan"
                value={form.firstName}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                icon={<User size={14} />}
                required
              />
              <Input
                label="Apellido"
                placeholder="García"
                value={form.lastName}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              icon={<Mail size={14} />}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              icon={<Lock size={14} />}
              required
              minLength={8}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Crear cuenta admin
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-600 font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
