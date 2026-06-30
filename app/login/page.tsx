'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function ingresar() {
    setMensaje('')
    setCargando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 flex items-center justify-center p-6 text-gray-900">
      <section className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-yellow-400">

        <div className="bg-green-800 text-white p-6 text-center">

          <div className="text-6xl mb-3">
            ⚽🏆
          </div>

          <h1 className="text-3xl font-black">
            La Polla del Mundial!!
          </h1>

          <p className="text-yellow-300 font-bold mt-2">
            Inicia sesión para registrar tus pronósticos
          </p>

        </div>

        <div className="p-6 space-y-5">

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-green-700"
          />

          <input
            type="email"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-green-700"
          />

          <button
            onClick={ingresar}
            disabled={cargando}
            className="w-full bg-green-800 hover:bg-green-900 text-white font-black rounded-xl p-3 shadow-lg disabled:opacity-50 transition"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          {mensaje && (
            <div className="bg-red-100 border border-red-400 rounded-xl p-3">
              <p className="text-red-700 text-sm font-bold text-center">
                {mensaje}
              </p>
            </div>
          )}

        </div>

      </section>
    </main>
  )
}