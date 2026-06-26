'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function nombreFase(fase: number) {
  if (fase === 1) return 'Fase de grupos'
  if (fase === 2) return 'Dieciseisavos'
  if (fase === 3) return 'Octavos'
  if (fase === 4) return 'Cuartos'
  if (fase === 5) return 'Semifinal'
  if (fase === 6) return 'Tercer puesto'
  if (fase === 7) return 'Final'
  return `Fase ${fase}`
}

export default function AdminPartidosPage() {
  const [esAdmin, setEsAdmin] = useState(false)
  const [validando, setValidando] = useState(true)
  const [equipos, setEquipos] = useState<any[]>([])
  const [partidos, setPartidos] = useState<any[]>([])
  const [faseSeleccionada, setFaseSeleccionada] = useState('2')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    validarAdmin()
  }, [])

  useEffect(() => {
    if (esAdmin) {
      cargarPartidos()
    }
  }, [esAdmin, faseSeleccionada])

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
    cargarEquipos()
  }

  async function cargarEquipos() {
    const { data, error } = await supabase
      .from('equipos')
      .select('id, nombre, grupo')
      .order('nombre', { ascending: true })

    if (error) {
      setMensaje(error.message)
      return
    }

    setEquipos(data || [])
  }

  async function cargarPartidos() {
    setCargando(true)
    setMensaje('')

    const { data, error } = await supabase
      .from('partidos')
      .select(`
        id,
        grupo,
        fase,
        fecha_hora,
        equipo_1_id,
        equipo_2_id,
        goles_equipo_1_real,
        goles_equipo_2_real,
        equipo_1:equipos!partidos_equipo_1_id_fkey(id, nombre),
        equipo_2:equipos!partidos_equipo_2_id_fkey(id, nombre)
      `)
      .eq('fase', Number(faseSeleccionada))
      .order('fecha_hora', { ascending: true })

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    setPartidos(data || [])
    setCargando(false)
  }

  function cambiarEquipo(partidoId: number, campo: string, valor: string) {
    setPartidos((actuales) =>
      actuales.map((partido) =>
        partido.id === partidoId
          ? {
              ...partido,
              [campo]: valor,
            }
          : partido
      )
    )
  }

  async function guardarPartido(partido: any) {
    setMensaje('')

    if (!partido.equipo_1_id || !partido.equipo_2_id) {
      setMensaje('Debes seleccionar los dos equipos.')
      return
    }

    if (partido.equipo_1_id === partido.equipo_2_id) {
      setMensaje('Un equipo no puede jugar contra sí mismo.')
      return
    }

    const confirmar = confirm(
      `¿Confirmas actualizar el partido ${partido.id}?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('partidos')
      .update({
        equipo_1_id: partido.equipo_1_id,
        equipo_2_id: partido.equipo_2_id,
      })
      .eq('id', partido.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setMensaje('Partido actualizado correctamente.')
    cargarPartidos()

    setTimeout(() => setMensaje(''), 2500)
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
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-5xl mb-2">🔄⚽</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Actualizar partidos
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Asigna los equipos clasificados a los partidos de las siguientes fases.
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

        <section className="bg-white rounded-3xl shadow-xl p-5 mb-6">
          <h2 className="text-xl font-black text-green-800 mb-4">
            Seleccionar fase
          </h2>

          <select
            value={faseSeleccionada}
            onChange={(e) => setFaseSeleccionada(e.target.value)}
            className="w-full md:w-auto border-2 border-gray-300 rounded-2xl px-5 py-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
          >
            <option value="2">Dieciseisavos</option>
            <option value="3">Octavos</option>
            <option value="4">Cuartos</option>
            <option value="5">Semifinales</option>
            <option value="6">Tercer puesto</option>
            <option value="7">Final</option>
          </select>
        </section>

        {mensaje && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-4 mb-6 text-yellow-900 font-bold">
            {mensaje}
          </div>
        )}

        {cargando && (
          <div className="bg-white rounded-3xl shadow-xl p-5 mb-6">
            <p className="font-bold text-gray-700">Cargando partidos...</p>
          </div>
        )}

        {!cargando && partidos.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-5 mb-6">
            <p className="font-bold text-gray-700">
              No hay partidos registrados para esta fase.
            </p>
          </div>
        )}

        <section className="space-y-4">
          {partidos.map((partido: any) => (
            <div
              key={partido.id}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-5"
            >
              <div className="mb-4">
                <p className="text-sm text-gray-700 font-bold">
                  Partido {partido.id} · {nombreFase(partido.fase)} ·{' '}
                  {formatearFecha(partido.fecha_hora)}
                </p>

                {(partido.goles_equipo_1_real !== null ||
                  partido.goles_equipo_2_real !== null) && (
                  <p className="text-sm text-red-700 font-black mt-1">
                    Este partido ya tiene marcador registrado.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_60px_1fr_160px] gap-3 items-center">
                <select
                  value={partido.equipo_1_id || ''}
                  onChange={(e) =>
                    cambiarEquipo(partido.id, 'equipo_1_id', e.target.value)
                  }
                  className="border-2 border-gray-300 rounded-2xl p-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
                >
                  <option value="">Equipo 1</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre} ({equipo.id})
                    </option>
                  ))}
                </select>

                <p className="text-center font-black text-green-800">vs</p>

                <select
                  value={partido.equipo_2_id || ''}
                  onChange={(e) =>
                    cambiarEquipo(partido.id, 'equipo_2_id', e.target.value)
                  }
                  className="border-2 border-gray-300 rounded-2xl p-3 text-gray-900 font-bold bg-white focus:outline-none focus:border-green-700"
                >
                  <option value="">Equipo 2</option>
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre} ({equipo.id})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => guardarPartido(partido)}
                  className="bg-green-800 hover:bg-green-900 text-white font-black rounded-2xl px-5 py-3 shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}