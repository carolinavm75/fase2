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

function fechaEsPermitida(fecha: string) {
  return fecha > fechaColombia(0)
}

export default function PronosticosPorFechaPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [pronosticos, setPronosticos] = useState<any[]>([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarUsuario()
  }, [])

  async function cargarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setUsuario(user)
  }

  async function cargarPartidosPorFecha(fecha: string) {
    setMensaje('')
    setPronosticos([])

    if (!fechaEsPermitida(fecha)) {
      setMensaje('No puedes modificar partidos de hoy ni de fechas anteriores.')
      return
    }

    setFechaSeleccionada(fecha)
    setCargando(true)

    const inicio = `${fecha}T00:00:00-05:00`
    const fin = `${fecha}T23:59:59-05:00`

    const { data, error } = await supabase
      .from('pronosticos')
      .select(`
        id,
        goles_equipo_1,
        goles_equipo_2,
        partido:partidos!pronosticos_partido_id_fkey(
          id,
          grupo,
          fecha_hora,
          fase,
          equipo_1:equipos!partidos_equipo_1_id_fkey(id, nombre),
          equipo_2:equipos!partidos_equipo_2_id_fkey(id, nombre)
        )
      `)
      .eq('usuario_id', usuario.id)
      .gte('partido.fecha_hora', inicio)
      .lte('partido.fecha_hora', fin)

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    const filtrados = (data || [])
      .filter((p: any) => p.partido !== null)
      .sort(
        (a: any, b: any) =>
          new Date(a.partido.fecha_hora).getTime() -
          new Date(b.partido.fecha_hora).getTime()
      )

    setPronosticos(filtrados)
    setCargando(false)
  }

  function cambiarMarcador(id: number, campo: string, valor: string) {
    setPronosticos((actuales) =>
      actuales.map((p) =>
        p.id === id
          ? {
              ...p,
              [campo]: valor,
            }
          : p
      )
    )
  }

  async function guardarPronostico(pronostico: any) {
    if (
      pronostico.goles_equipo_1 === '' ||
      pronostico.goles_equipo_2 === '' ||
      pronostico.goles_equipo_1 === null ||
      pronostico.goles_equipo_2 === null
    ) {
      setMensaje('Debes ingresar marcador para ambos equipos.')
      return
    }

    const { error } = await supabase
      .from('pronosticos')
      .update({
        goles_equipo_1: Number(pronostico.goles_equipo_1),
        goles_equipo_2: Number(pronostico.goles_equipo_2),
        fecha_modificacion: new Date().toISOString(),
      })
      .eq('id', pronostico.id)
      .eq('usuario_id', usuario.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setMensaje('Pronóstico actualizado correctamente.')
    setTimeout(() => setMensaje(''), 2500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-4xl mb-2">📅⚽</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Pronósticos por fecha
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Elige una fecha futura y registra tus marcadores antes del día del partido.
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
            Selecciona la fecha
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg disabled:opacity-50"
              onClick={() => cargarPartidosPorFecha(fechaColombia(1))}
              disabled={!usuario}
            >
              Partidos de mañana
            </button>

            <button
              className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg disabled:opacity-50"
              onClick={() => cargarPartidosPorFecha(fechaColombia(2))}
              disabled={!usuario}
            >
              Partidos de pasado mañana
            </button>

            <input
              type="date"
              className="border-2 border-gray-300 rounded-2xl px-5 py-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
              value={fechaSeleccionada}
              min={fechaColombia(1)}
              onChange={(e) => cargarPartidosPorFecha(e.target.value)}
            />
          </div>

          <p className="text-gray-700 mt-4 font-medium">
            No se pueden modificar partidos de hoy ni de fechas anteriores.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black text-green-800">
                {fechaSeleccionada
                  ? `Partidos del ${fechaSeleccionada}`
                  : 'Partidos disponibles'}
              </h2>

              <p className="text-gray-700">
                Selecciona una fecha para consultar y actualizar tus pronósticos.
              </p>
            </div>

            <div className="bg-green-100 text-green-900 font-black rounded-2xl px-4 py-2 text-center">
              {pronosticos.length} partidos
            </div>
          </div>

          {mensaje && (
            <p className="mb-4 bg-green-100 border border-green-400 text-green-900 font-bold rounded-xl p-3">
              {mensaje}
            </p>
          )}

          {cargando && (
            <p className="text-gray-700 font-bold">Cargando partidos...</p>
          )}

          {!cargando && fechaSeleccionada && pronosticos.length === 0 && !mensaje && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-4 text-yellow-900 font-bold">
              No hay partidos disponibles para esa fecha.
            </div>
          )}

          <div className="space-y-4">
            {pronosticos.map((pronostico: any) => (
              <div
                key={pronostico.id}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-md"
              >
                <p className="text-sm text-gray-700 font-bold mb-4">
                  Fase {pronostico.partido.fase} · 🗓️{' '}
                  {formatearFecha(pronostico.partido.fecha_hora)}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_40px_90px_1fr] gap-3 items-center">
                  <p className="font-black text-lg text-green-900 md:text-right">
                    {pronostico.partido.equipo_1.nombre}
                  </p>

                  <input
                    type="number"
                    min="0"
                    className="border-2 border-gray-300 rounded-2xl p-3 text-center text-xl font-black bg-white text-gray-900 focus:outline-none focus:border-green-700"
                    value={pronostico.goles_equipo_1 ?? ''}
                    onChange={(e) =>
                      cambiarMarcador(
                        pronostico.id,
                        'goles_equipo_1',
                        e.target.value
                      )
                    }
                  />

                  <p className="text-center font-black text-green-800">vs</p>

                  <input
                    type="number"
                    min="0"
                    className="border-2 border-gray-300 rounded-2xl p-3 text-center text-xl font-black bg-white text-gray-900 focus:outline-none focus:border-green-700"
                    value={pronostico.goles_equipo_2 ?? ''}
                    onChange={(e) =>
                      cambiarMarcador(
                        pronostico.id,
                        'goles_equipo_2',
                        e.target.value
                      )
                    }
                  />

                  <p className="font-black text-lg text-green-900">
                    {pronostico.partido.equipo_2.nombre}
                  </p>
                </div>

                <button
                  onClick={() => guardarPronostico(pronostico)}
                  className="mt-5 w-full md:w-auto bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg"
                >
                  Guardar marcador
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}