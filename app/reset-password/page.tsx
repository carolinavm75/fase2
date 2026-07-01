'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [adminId, setAdminId] = useState('')
  const [esAdmin, setEsAdmin] = useState(false)
  const [validando, setValidando] = useState(true)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [usuarioId, setUsuarioId] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    validarAdmin()
  }, [])

  async function validarAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setAdminId(user.id)

    const { data, error } = await supabase
      .from('administradores')
      .select('usuario_id')
      .eq('usuario_id', user.id)
      .single()

    if (error || !data) {
      setMensaje('No tienes permisos para acceder a esta página.')
      setEsAdmin(false)
      setValidando(false)
      return
    }

    setEsAdmin(true)
    setValidando(false)
    cargarUsuarios()
  }

  async function cargarUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .order('nombre', { ascending: true })

    if (error) {
      setMensaje(error.message)
      return
    }

    setUsuarios(data || [])
  }

  async function cambiarPassword() {
    setMensaje('')

    if (!usuarioId || !nuevaPassword) {
      setMensaje('Selecciona un usuario y escribe una nueva contraseña.')
      return
    }

    if (nuevaPassword.length < 6) {
      setMensaje('La contraseña debe tener mínimo 6 caracteres.')
      return
    }

    setCargando(true)

    const respuesta = await fetch('/api/admin-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId,
        userId: usuarioId,
        nuevaPassword,
      }),
    })

    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      setMensaje(resultado.error || 'No se pudo actualizar la contraseña.')
      setCargando(false)
      return
    }

    setMensaje('Contraseña actualizada correctamente.')
    setUsuarioId('')
    setNuevaPassword('')
    setCargando(false)
  }

  if (validando) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-6">
        <section className="max-w-4xl mx-auto bg-white rounded-3xl p-6 shadow-xl">
          <p className="font-bold text-gray-700">Validando permisos...</p>
        </section>
      </main>
    )
  }

  if (!esAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-6 text-gray-900">
        <section className="max-w-4xl mx-auto bg-red-100 border border-red-400 rounded-3xl p-6 shadow-xl">
          <p className="font-black text-red-800">{mensaje}</p>

          <button
            onClick={() => (window.location.href = '/')}
            className="mt-5 bg-white text-green-800 border-2 border-green-800 font-black rounded-xl px-5 py-3"
          >
            Volver al inicio
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-5xl mb-2">🔐⚽</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Resetear contraseña
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Selecciona un usuario y asigna una nueva contraseña temporal.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = '/')}
              className="bg-white text-green-800 border-2 border-green-800 hover:bg-green-50 font-black rounded-xl px-5 py-3"
            >
              Volver al inicio
            </button>
          </div>
        </header>

        {mensaje && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-4 mb-6 text-yellow-900 font-bold">
            {mensaje}
          </div>
        )}

        <section className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <div>
            <label className="font-black text-green-800 block mb-2">
              Usuario
            </label>

            <select
              className="w-full border-2 border-gray-300 rounded-2xl p-3 text-gray-900 font-bold bg-white"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
            >
              <option value="">Selecciona un usuario</option>

              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} — {u.correo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-black text-green-800 block mb-2">
              Nueva contraseña
            </label>

            <input
              className="w-full border-2 border-gray-300 rounded-2xl p-3 text-gray-900 font-bold bg-white"
              type="text"
              placeholder="Escribe la nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
          </div>

          <button
            onClick={cambiarPassword}
            disabled={cargando}
            className="w-full bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl p-3 shadow-lg disabled:opacity-50"
          >
            {cargando ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </section>
      </div>
    </main>
  )
}