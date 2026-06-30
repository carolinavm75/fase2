'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminCodigosPage() {
  const [esAdmin, setEsAdmin] = useState(false)
  const [validando, setValidando] = useState(true)
  const [codigos, setCodigos] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [nuevoCodigo, setNuevoCodigo] = useState('')

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
    cargarCodigos()
  }

  async function cargarCodigos() {
    const { data, error } = await supabase
      .from('codigos_registro')
      .select(`
        codigo,
        usado,
        usado_por,
        usado_en,
        usuario:usuarios!codigos_registro_usado_por_fkey(
          nombre,
          correo
        )
      `)
      .order('codigo', { ascending: true })

    if (error) {
      setMensaje(error.message)
      return
    }

    setCodigos(data || [])
  }

  async function crearCodigo() {
    setMensaje('')

    if (!nuevoCodigo.trim()) {
      setMensaje('Debes escribir un código.')
      return
    }

    const { error } = await supabase.from('codigos_registro').insert({
      codigo: nuevoCodigo.trim(),
      usado: false,
    })

    if (error) {
      setMensaje(error.message)
      return
    }

    setNuevoCodigo('')
    setMensaje('Código creado correctamente.')
    cargarCodigos()
  }

  async function liberarCodigo(codigo: string) {
    const confirmar = confirm(`¿Seguro que quieres liberar el código ${codigo}?`)

    if (!confirmar) return

    const { error } = await supabase
      .from('codigos_registro')
      .update({
        usado: false,
        usado_por: null,
        usado_en: null,
      })
      .eq('codigo', codigo)

    if (error) {
      setMensaje(error.message)
      return
    }

    setMensaje('Código liberado correctamente.')
    cargarCodigos()
  }

  const libres = codigos.filter((c) => !c.usado)
  const usados = codigos.filter((c) => c.usado)

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
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-5xl mb-2">🎫⚽</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Administración de códigos
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Consulta códigos libres, usados y crea nuevos códigos de registro.
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow-xl">
            <p className="text-gray-700 font-bold">Total códigos</p>
            <p className="text-4xl font-black text-green-800">
              {codigos.length}
            </p>
          </div>

          <div className="bg-green-100 rounded-3xl p-5 shadow-xl border border-green-400">
            <p className="text-green-900 font-bold">Libres</p>
            <p className="text-4xl font-black text-green-900">
              {libres.length}
            </p>
          </div>

          <div className="bg-yellow-100 rounded-3xl p-5 shadow-xl border border-yellow-400">
            <p className="text-yellow-900 font-bold">Usados</p>
            <p className="text-4xl font-black text-yellow-900">
              {usados.length}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <h2 className="text-2xl font-black text-green-800 mb-4">
            Crear nuevo código
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
            <input
              className="border-2 border-gray-300 rounded-2xl p-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
              placeholder="Ejemplo: 418527"
              value={nuevoCodigo}
              onChange={(e) => setNuevoCodigo(e.target.value)}
            />

            <button
              onClick={crearCodigo}
              className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg"
            >
              Crear código
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <h2 className="text-2xl font-black text-green-800 mb-4">
            Códigos libres
          </h2>

          {libres.length === 0 && (
            <p className="font-bold text-gray-700">
              No hay códigos libres disponibles.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {libres.map((c) => (
              <div
                key={c.codigo}
                className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center"
              >
                <p className="font-black text-green-900 text-xl">
                  {c.codigo}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-5">
          <h2 className="text-2xl font-black text-green-800 mb-4">
            Códigos usados
          </h2>

          {usados.length === 0 && (
            <p className="font-bold text-gray-700">
              Todavía no hay códigos usados.
            </p>
          )}

          <div className="space-y-4">
            {usados.map((c) => (
              <div
                key={c.codigo}
                className="bg-yellow-50 border-l-8 border-yellow-500 rounded-3xl p-5 shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_180px_140px] gap-3 items-center">
                  <p className="font-black text-yellow-900 text-2xl">
                    {c.codigo}
                  </p>

                  <div>
                    <p className="font-black text-green-900 text-lg">
                      {c.usuario?.nombre || 'Usuario no encontrado'}
                    </p>

                    <p className="text-gray-700 font-medium">
                      {c.usuario?.correo || 'Sin correo'}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 md:text-right">
                    {c.usado_en
                      ? new Date(c.usado_en).toLocaleString('es-CO')
                      : 'Sin fecha'}
                  </p>

                  <button
                    onClick={() => liberarCodigo(c.codigo)}
                    className="bg-white text-red-700 border-2 border-red-500 hover:bg-red-50 font-black rounded-xl px-4 py-2"
                  >
                    Liberar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}