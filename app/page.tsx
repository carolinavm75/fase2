'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [nombre, setNombre] = useState('')
  const [esAdmin, setEsAdmin] = useState(false)

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

    const { data } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id', user.id)
      .single()

    if (data) {
      setNombre(data.nombre)
    }

    const { data: admin } = await supabase
      .from('administradores')
      .select('usuario_id')
      .eq('usuario_id', user.id)
      .maybeSingle()

    setEsAdmin(!!admin)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const opciones = [
    {
      titulo: 'Pronósticos por fecha',
      icono: '📅',
      ruta: '/pronosticos-fecha',
    },
    {
      titulo: 'Resultados',
      icono: '📊',
      ruta: '/resultados',
    },
    {
      titulo: 'Tabla de posiciones',
      icono: '🏆',
      ruta: '/posiciones',
    },
    {
      titulo: 'Reglas',
      icono: '📜',
      ruta: '/reglas',
    },
  ]

  const admin = [
    {
      titulo: 'Registrar Equipos',
      icono: '⚽',
      ruta: '/admin-equipos',
    },
    {
      titulo: 'Restablecer contraseña',
      icono: '🔑',
      ruta: '/reset-password',
    },
    {
      titulo: 'Códigos de registro',
      icono: '🎫',
      ruta: '/admin-codigos',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-6">

      <div className="max-w-6xl mx-auto">

        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-8 mb-8">

          <div className="text-center">

            <div className="text-7xl">
              ⚽🏆
            </div>

            <h1 className="text-5xl font-black text-green-800 mt-3">
              La Polla del Mundial
            </h1>

            <p className="text-gray-700 text-xl mt-4">
              Bienvenido
            </p>

            <p className="text-3xl font-black text-yellow-700 mt-2">
              {nombre}
            </p>

          </div>

        </header>

        <section className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">

          {opciones.map((opcion) => (

            <button
              key={opcion.ruta}
              onClick={() => (window.location.href = opcion.ruta)}
              className="bg-white rounded-3xl p-8 shadow-xl hover:scale-105 transition border-4 border-yellow-300"
            >

              <div className="text-6xl mb-4">
                {opcion.icono}
              </div>

              <h2 className="text-2xl font-black text-green-800">
                {opcion.titulo}
              </h2>

            </button>

          ))}

        </section>

        {esAdmin && (

          <>
            <h2 className="text-white text-3xl font-black mt-10 mb-5">
              Administración
            </h2>

            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {admin.map((opcion) => (

                <button
                  key={opcion.ruta}
                  onClick={() => (window.location.href = opcion.ruta)}
                  className="bg-yellow-100 rounded-3xl p-6 shadow-xl hover:scale-105 transition border-4 border-yellow-500"
                >

                  <div className="text-5xl mb-3">
                    {opcion.icono}
                  </div>

                  <h2 className="text-xl font-black text-green-800">
                    {opcion.titulo}
                  </h2>

                </button>

              ))}

            </section>

          </>

        )}

        <div className="text-center mt-10">

          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl"
          >
            Cerrar sesión
          </button>

        </div>

      </div>

    </main>
  )
}