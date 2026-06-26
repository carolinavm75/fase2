'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegistroPage() {
  const [codigo, setCodigo] = useState('')
  const [codigoValido, setCodigoValido] = useState(false)
  const [validandoCodigo, setValidandoCodigo] = useState(true)

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    validarCodigo()
  }, [])

  async function validarCodigo() {
    setMensaje('')
    setValidandoCodigo(true)

    const params = new URLSearchParams(window.location.search)
    const codigoUrl = params.get('codigo')?.trim()

    if (!codigoUrl) {
      setMensaje('El link de registro no tiene código de invitación.')
      setCodigoValido(false)
      setValidandoCodigo(false)
      return
    }

    setCodigo(codigoUrl)

    const { data, error } = await supabase.rpc('validar_codigo_registro', {
      p_codigo: codigoUrl,
    })

    if (error) {
      setMensaje(error.message)
      setCodigoValido(false)
      setValidandoCodigo(false)
      return
    }

    if (data !== true) {
      setMensaje('Este código de registro no existe o ya fue utilizado.')
      setCodigoValido(false)
      setValidandoCodigo(false)
      return
    }

    setCodigoValido(true)
    setValidandoCodigo(false)
  }

  async function registrar() {
    setMensaje('')
    setCargando(true)

    if (!codigoValido) {
      setMensaje('Código de registro inválido.')
      setCargando(false)
      return
    }

    if (!nombre || !email || !password) {
      setMensaje('Debes completar nombre, correo y contraseña.')
      setCargando(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
      },
    })

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    if (!data.user) {
      setMensaje('No se pudo crear el usuario.')
      setCargando(false)
      return
    }

    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (errorLogin) {
      setMensaje(errorLogin.message)
      setCargando(false)
      return
    }

    const { data: codigoConsumido, error: errorCodigo } = await supabase.rpc(
      'consumir_codigo_registro',
      {
        p_codigo: codigo,
      }
    )

    if (errorCodigo || !codigoConsumido) {
      setMensaje('El código ya fue utilizado. No se puede completar el registro.')
      setCargando(false)
      return
    }

    const { error: errorUsuario } = await supabase.from('usuarios').insert({
      id: data.user.id,
      nombre,
      correo: email,
      codigo,
    })

    if (errorUsuario) {
      setMensaje(errorUsuario.message)
      setCargando(false)
      return
    }

    const { data: partidos, error: errorPartidos } = await supabase
      .from('partidos')
      .select('id')

    if (errorPartidos) {
      setMensaje(errorPartidos.message)
      setCargando(false)
      return
    }

    const pronosticosIniciales = (partidos || []).map((partido) => ({
      usuario_id: data.user!.id,
      partido_id: partido.id,
      goles_equipo_1: null,
      goles_equipo_2: null,
      puntos: null,
    }))

    const { error: errorPronosticos } = await supabase
      .from('pronosticos')
      .insert(pronosticosIniciales)

    if (errorPronosticos) {
      setMensaje(errorPronosticos.message)
      setCargando(false)
      return
    }

    setMensaje('Usuario registrado correctamente. Redirigiendo...')
    setCargando(false)

    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  }

  if (validandoCodigo) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 flex items-center justify-center p-6">
        <section className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-400">
          <p className="font-black text-green-800">Validando invitación...</p>
        </section>
      </main>
    )
  }

  if (!codigoValido) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 flex items-center justify-center p-6">
        <section className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-6 text-center">
          <div className="text-5xl mb-3">🚫⚽</div>

          <h1 className="text-3xl font-black text-green-800">
            Registro no disponible
          </h1>

          <p className="text-red-700 font-bold mt-4">{mensaje}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 flex items-center justify-center p-6 text-gray-900">
      <section className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-yellow-400">
        <div className="bg-green-800 text-white p-6 text-center">
          <div className="text-5xl mb-3">⚽🔥</div>

          <h1 className="text-3xl font-black">Crear cuenta</h1>

          <p className="text-yellow-300 font-bold mt-2">
            Código de invitación válido
          </p>

          <p className="text-sm text-white/80 mt-1">
            Código: {codigo}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <input
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-green-700"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-green-700"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-green-700"
            placeholder="Contraseña visible"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={registrar}
            disabled={cargando}
            className="w-full bg-green-800 hover:bg-green-900 text-white font-black rounded-xl p-3 shadow-lg disabled:opacity-50"
          >
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>

          {mensaje && (
            <p className="text-sm font-bold text-center text-red-700">
              {mensaje}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}