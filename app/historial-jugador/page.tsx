'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function textoPronostico(g1: number | null, g2: number | null) {
  if (g1 === null || g2 === null) return 'No registró'
  return `${g1} - ${g2}`
}

function colorPuntos(puntos: number | null, sinPronostico: boolean) {
  if (sinPronostico) return 'bg-gray-100 border-gray-400'
  if (puntos === 5) return 'bg-red-100 border-red-500'
  if (puntos === 2) return 'bg-green-100 border-green-500'
  return 'bg-yellow-100 border-yellow-500'
}

export default function HistorialJugadorPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [usuarioId, setUsuarioId] = useState('')
  const [historial, setHistorial] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    verificarSesion()
  }, [])

  async function verificarSesion() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    cargarUsuarios()
  }

  async function cargarUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre')
      .order('nombre', { ascending: true })

    if (error) {
      setMensaje(error.message)
      return
    }

    setUsuarios(data || [])
  }

  async function cargarHistorial(id: string) {
    setUsuarioId(id)
    setHistorial([])
    setMensaje('')

    if (!id) return

    setCargando(true)

    const { data, error } = await supabase
      .from('pronosticos')
      .select(`
        id,
        goles_equipo_1,
        goles_equipo_2,
        puntos,
        partido:partidos!pronosticos_partido_id_fkey(
          id,
          fecha_hora,
          goles_equipo_1_real,
          goles_equipo_2_real,
          equipo_1:equipos!partidos_equipo_1_id_fkey(nombre),
          equipo_2:equipos!partidos_equipo_2_id_fkey(nombre)
        )
      `)
      .eq('usuario_id', id)

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    const ordenado = (data || [])
      .filter(
        (item: any) =>
          item.partido !== null &&
          item.partido.goles_equipo_1_real !== null &&
          item.partido.goles_equipo_2_real !== null
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.partido.fecha_hora).getTime() -
          new Date(a.partido.fecha_hora).getTime()
      )

    setHistorial(ordenado)
    setCargando(false)
  }

  const usuarioSeleccionado = usuarios.find((u) => u.id === usuarioId)

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-4xl mb-2">📋⚽</div>

              <h1 className="text-2xl md:text-3xl font-black text-green-800">
                Historial de jugador
              </h1>

              <p className="text-sm text-gray-700 mt-2 font-medium">
                Solo se muestran partidos que ya tienen resultado.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = '/')}
              className="bg-white text-green-800 border-2 border-green-800 hover:bg-green-50 font-black rounded-xl px-4 py-2 text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <h2 className="text-lg font-black text-green-800 mb-3">
            Seleccionar jugador
          </h2>

          <select
            value={usuarioId}
            onChange={(e) => cargarHistorial(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
          >
            <option value="">Selecciona un jugador</option>

            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        </section>

        {mensaje && (
          <div className="bg-red-100 border border-red-400 rounded-2xl p-4 mb-6 text-red-800 text-sm font-bold">
            {mensaje}
          </div>
        )}

        {cargando && (
          <div className="bg-white rounded-3xl shadow-xl p-5 mb-6">
            <p className="font-bold text-sm text-gray-700">
              Cargando historial...
            </p>
          </div>
        )}

        {usuarioSeleccionado && !cargando && (
          <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
            <h2 className="text-xl font-black text-green-800">
              {usuarioSeleccionado.nombre}
            </h2>

            <p className="text-sm text-gray-700">
              {historial.length} partidos con resultado registrado.
            </p>
          </section>
        )}

        <section className="space-y-3">
          {historial.map((item: any) => {
            const sinPronostico =
              item.goles_equipo_1 === null || item.goles_equipo_2 === null

            const puntosMostrados = sinPronostico ? 0 : item.puntos ?? 0

            return (
              <div
                key={item.id}
                className={`border-l-8 rounded-2xl p-4 shadow-md ${colorPuntos(
                  item.puntos,
                  sinPronostico
                )}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_95px_95px_60px] gap-3 items-center">
                  <p className="font-black text-sm text-green-900">
                    {item.partido.equipo_1.nombre} vs{' '}
                    {item.partido.equipo_2.nombre} ( {item.partido.goles_equipo_1_real} - {item.partido.goles_equipo_2_real} )
                  </p>

                  <p className="text-sm">
  <span className="font-black text-gray-900">
    Pron: {textoPronostico(item.goles_equipo_1, item.goles_equipo_2)}
  </span>

  <span className="ml-4 font-black text-green-900">
    {puntosMostrados} pts
  </span>
</p>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}