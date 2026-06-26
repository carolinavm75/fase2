'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function fechaColombia(offsetDias = 0) {
  const ahora = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' })
  )

  ahora.setDate(ahora.getDate() + offsetDias)

  const year = ahora.getFullYear()
  const month = String(ahora.getMonth() + 1).padStart(2, '0')
  const day = String(ahora.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function colorPorPuntos(puntos: number | null) {
  if (puntos === 5) return 'bg-red-100 border-red-500'
  if (puntos === 2) return 'bg-green-100 border-green-500'
  if (puntos === 0) return 'bg-yellow-100 border-yellow-500'
  return 'bg-white border-gray-300'
}

function textoMarcador(goles1: number | null, goles2: number | null) {
  if (goles1 === null || goles2 === null) return 'Sin registro'
  return `${goles1} - ${goles2}`
}

export default function ResultadosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaColombia(0))
  const [partidos, setPartidos] = useState<any[]>([])
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<any>(null)
  const [pronosticos, setPronosticos] = useState<any[]>([])
  const [orden, setOrden] = useState<'usuario' | 'puntaje'>('usuario')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    verificarSesion()
  }, [])

  useEffect(() => {
    cargarPartidos(fechaSeleccionada)
  }, [fechaSeleccionada])

  async function verificarSesion() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
    }
  }

  async function cargarPartidos(fecha: string) {
    setMensaje('')
    setPartidos([])
    setPartidoSeleccionado(null)
    setPronosticos([])

    if (fecha > fechaColombia(0)) {
      setMensaje('No se pueden consultar partidos de mañana o fechas futuras.')
      return
    }

    setCargando(true)

    const inicio = `${fecha}T00:00:00-05:00`
    const fin = `${fecha}T23:59:59-05:00`

    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        grupo,
        fecha_hora,
        fase,
        goles_equipo_1_real,
        goles_equipo_2_real,
        equipo_1:equipos!partidos_equipo_1_id_fkey(id, nombre),
        equipo_2:equipos!partidos_equipo_2_id_fkey(id, nombre)
      `)
      .gte('fecha_hora', inicio)
      .lte('fecha_hora', fin)
      .order('fecha_hora', { ascending: true })

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    setPartidos(data || [])
    setCargando(false)
  }

  async function cargarPronosticos(partido: any) {
    setPartidoSeleccionado(partido)
    setPronosticos([])
    setMensaje('')

    const { data, error } = await supabase
      .from('pronosticos')
      .select(`
        id,
        goles_equipo_1,
        goles_equipo_2,
        puntos,
        usuario:usuarios!pronosticos_usuario_id_fkey(
          nombre
        )
      `)
      .eq('partido_id', partido.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setPronosticos(data || [])
  }

  const pronosticosOrdenados = [...pronosticos].sort((a, b) => {
    if (orden === 'puntaje') {
      return (b.puntos ?? -1) - (a.puntos ?? -1)
    }

    return (a.usuario?.nombre || '').localeCompare(b.usuario?.nombre || '')
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-4xl mb-2">📊🏆</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Resultados y pronósticos
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Consulta los partidos de hoy o fechas anteriores.
              </p>
            </div>

            <button
              className="bg-white text-green-800 border-2 border-green-800 hover:bg-green-50 font-black rounded-xl px-5 py-3"
              onClick={() => (window.location.href = '/')}
            >
              Volver al inicio
            </button>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <h2 className="text-xl font-black text-green-800 mb-4">
            Seleccionar fecha
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg"
              onClick={() => setFechaSeleccionada(fechaColombia(-1))}
            >
              Ayer
            </button>

            <button
              className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg"
              onClick={() => setFechaSeleccionada(fechaColombia(0))}
            >
              Hoy
            </button>

            <input
              type="date"
              className="border-2 border-gray-300 rounded-2xl px-5 py-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
              value={fechaSeleccionada}
              max={fechaColombia(0)}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </section>

        {mensaje && (
          <div className="bg-red-100 border border-red-400 rounded-2xl p-4 mb-6 text-red-800 font-bold">
            {mensaje}
          </div>
        )}

        {cargando && (
          <div className="bg-white rounded-2xl shadow-xl p-5 mb-6">
            <p className="font-bold text-gray-700">Cargando partidos...</p>
          </div>
        )}

        {!cargando && partidos.length === 0 && !mensaje && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-5 mb-6 text-yellow-900 font-bold">
            No hay partidos para la fecha seleccionada.
          </div>
        )}

        {partidos.length > 0 && (
          <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-black text-green-800">
                  Partidos del {fechaSeleccionada}
                </h2>

                <p className="text-gray-700">
                  Selecciona un partido para ver los pronósticos.
                </p>
              </div>

              <div className="bg-green-100 text-green-900 font-black rounded-2xl px-4 py-2 text-center">
                {partidos.length} partidos
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {partidos.map((partido: any) => (
                <button
                  key={partido.id}
                  onClick={() => cargarPronosticos(partido)}
                  className={`rounded-2xl px-5 py-4 border-2 transition text-left ${
                    partidoSeleccionado?.id === partido.id
                      ? 'bg-green-800 text-white border-green-900 shadow-xl scale-[1.02]'
                      : 'bg-yellow-50 text-green-900 border-yellow-300 hover:bg-yellow-100'
                  }`}
                >
                  <span className="font-black text-lg">
                    {partido.equipo_1.id} vs {partido.equipo_2.id}
                  </span>

                  <br />

                  <span className="text-sm font-medium">
                    {formatearFecha(partido.fecha_hora)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {partidoSeleccionado && (
          <section className="bg-white rounded-3xl shadow-xl p-4 sm:p-5">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 mb-6">
              <p className="text-sm text-gray-700 font-bold mb-2">
                Grupo {partidoSeleccionado.grupo} · Fase{' '}
                {partidoSeleccionado.fase}
              </p>

              <h2 className="text-2xl sm:text-3xl font-black text-green-800">
                {partidoSeleccionado.equipo_1.nombre} vs{' '}
                {partidoSeleccionado.equipo_2.nombre}
              </h2>

              <p className="text-gray-700 mt-2">
                {formatearFecha(partidoSeleccionado.fecha_hora)}
              </p>

              {partidoSeleccionado.goles_equipo_1_real !== null &&
              partidoSeleccionado.goles_equipo_2_real !== null ? (
                <div className="mt-4 bg-green-100 border border-green-400 rounded-2xl p-4">
                  <p className="text-xl sm:text-2xl font-black text-green-900">
                    Resultado real:{' '}
                    {partidoSeleccionado.goles_equipo_1_real} -{' '}
                    {partidoSeleccionado.goles_equipo_2_real}
                  </p>
                </div>
              ) : (
                <div className="mt-4 bg-yellow-100 border border-yellow-400 rounded-2xl p-4">
                  <p className="font-bold text-yellow-900">
                    Este partido aún no tiene resultado registrado.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setOrden('usuario')}
                className={`rounded-2xl px-5 py-3 border-2 font-black ${
                  orden === 'usuario'
                    ? 'bg-green-800 text-white border-green-900'
                    : 'bg-white text-green-800 border-green-800'
                }`}
              >
                Ordenar por usuario
              </button>

              <button
                onClick={() => setOrden('puntaje')}
                className={`rounded-2xl px-5 py-3 border-2 font-black ${
                  orden === 'puntaje'
                    ? 'bg-green-800 text-white border-green-900'
                    : 'bg-white text-green-800 border-green-800'
                }`}
              >
                Ordenar por puntaje
              </button>
            </div>

            <div className="space-y-4">
              {pronosticosOrdenados.map((pronostico: any) => (
                <div
                  key={pronostico.id}
                  className={`border-l-8 rounded-3xl p-5 shadow-md overflow-hidden ${colorPorPuntos(
                    pronostico.puntos
                  )}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_100px] gap-3 sm:gap-4 items-center">
                    <p className="font-black text-lg sm:text-xl text-green-900 break-words">
                      {pronostico.usuario?.nombre || 'Usuario sin nombre'}
                    </p>

                    <p className="text-2xl font-black text-left sm:text-center text-gray-900">
                      {textoMarcador(
                        pronostico.goles_equipo_1,
                        pronostico.goles_equipo_2
                      )}
                    </p>

                    <p className="text-2xl font-black text-left sm:text-right text-gray-900">
                      {pronostico.puntos === null
                        ? ''
                        : `${pronostico.puntos} pts`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {pronosticosOrdenados.length === 0 && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-5 mt-6">
                <p className="font-bold text-yellow-900">
                  No hay pronósticos registrados para este partido.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}