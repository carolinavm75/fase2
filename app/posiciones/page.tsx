'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function colorFila(posicion: number) {
  if (posicion === 1) return 'bg-yellow-200 border-yellow-500'
  if (posicion === 2) return 'bg-yellow-100 border-yellow-500'
  if (posicion === 3) return 'bg-yellow-50 border-yellow-500'
  return 'bg-white border-gray-300'
}

function iconoPosicion(posicion: number) {
  if (posicion === 1) return '🥇'
  if (posicion === 2) return '🥈'
  if (posicion === 3) return '🥉'
  return `${posicion}`
}

export default function PosicionesPage() {
  const [posiciones, setPosiciones] = useState<any[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarPosiciones()
  }, [])

  async function cargarPosiciones() {
    setCargando(true)
    setMensaje('')

    const { data, error } = await supabase
      .from('vista_posiciones')
      .select('id, nombre, codigo, puntos')
      .order('puntos', { ascending: false })
      .order('nombre', { ascending: true })
      .limit(100)

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    setPosiciones(data || [])
    setCargando(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-4xl mb-2">🏆📊</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Tabla de posiciones
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Ranking general de participantes según los puntos obtenidos.
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

        {mensaje && (
          <div className="bg-red-100 border border-red-400 rounded-2xl p-4 mb-6 text-red-800 font-bold">
            {mensaje}
          </div>
        )}

        {cargando && (
          <div className="bg-white rounded-3xl shadow-xl p-5">
            <p className="font-bold text-gray-700">Cargando posiciones...</p>
          </div>
        )}

        {!cargando && posiciones.length === 0 && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-2xl p-5 text-yellow-900 font-bold">
            Aún no hay posiciones disponibles.
          </div>
        )}

        {!cargando && posiciones.length > 0 && (
          <section className="bg-white rounded-3xl shadow-xl p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-black text-green-800">
                  Clasificación general
                </h2>

                <p className="text-gray-700">
                  Las primeras tres posiciones están en zona de premiación.
                </p>
              </div>

              <div className="bg-green-100 text-green-900 font-black rounded-2xl px-4 py-2 text-center">
                {posiciones.length} participantes
              </div>
            </div>

            <div className="space-y-4">
              {posiciones.map((usuario: any, index) => {
                const posicion = index + 1

                return (
                  <div
                    key={usuario.id}
                    className={`border-l-8 rounded-3xl p-4 sm:p-5 shadow-md overflow-hidden ${colorFila(
                      posicion
                    )}`}
                  >
                    <div className="grid grid-cols-[45px_1fr_58px] sm:grid-cols-[90px_1fr_140px] gap-3 sm:gap-4 items-center">
                      <p className="text-lg sm:text-3xl font-black text-center text-green-900">
                        {iconoPosicion(posicion)}
                      </p>

                      <div className="min-w-0">
                        <p className="font-black text-base sm:text-xl text-green-900 break-words">
                          {usuario.nombre}
                        </p>

                        {usuario.codigo && (
                          <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-1">
                           
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg sm:text-3xl font-black text-green-900 leading-none">
                          {usuario.puntos}
                        </p>

                        <p className="text-[9px] sm:text-sm font-bold text-green-700 leading-none mt-1">
                          pts
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}