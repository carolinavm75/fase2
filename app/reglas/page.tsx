'use client'

const reglas = [
  {
    titulo: 'Participación',
    texto:
      'Cada participante contará con acceso a la plataforma para registrar y consultar sus pronósticos. El uso de la plataforma implica la aceptación total de estas reglas y condiciones.',
    emoji: '👤',
  },
  {
    titulo: 'Alcance de la competencia',
    texto:
      'La polla tendrá en cuenta los partidos habilitados en la plataforma para esta fase del Mundial.',
    emoji: '⚽',
  },
  {
    titulo: 'Registro de pronósticos',
    texto:
      'Cada participante es responsable de ingresar, revisar y guardar correctamente sus marcadores en la plataforma.',
    emoji: '📝',
  },
  {
    titulo: 'Límite para modificar marcadores',
    texto:
      'Los marcadores podrán modificarse hasta las 11:00 p.m. del día anterior al partido. El mismo día del partido ya no será posible realizar cambios.',
    emoji: '⏰',
  },
  {
    titulo: 'Marcadores no registrados',
    texto:
      'Si un participante no registra un marcador antes del cierre, ese partido quedará sin pronóstico registrado para ese usuario.',
    emoji: '🔒',
  },
  {
    titulo: 'Sistema de puntuación',
    texto:
      'Se asignan 5 puntos por acertar el marcador exacto, 2 puntos por acertar únicamente el ganador del partido o el empate, y 0 puntos si no se acierta ni el marcador exacto ni el resultado general.',
    emoji: '🎯',
  },
  {
    titulo: 'Resultado oficial válido',
    texto:
      'Los puntos se calcularán únicamente con base en el resultado oficial al finalizar el tiempo reglamentario del partido.',
    emoji: '📊',
  },
  {
    titulo: 'Consulta de pronósticos',
    texto:
      'Los pronósticos de los demás participantes únicamente estarán visibles desde el día del partido en adelante.',
    emoji: '👀',
  },
  {
    titulo: 'Tabla de posiciones',
    texto:
      'La tabla de posiciones se actualizará con los puntos acumulados de cada participante y se organizará de mayor a menor puntaje.',
    emoji: '🏆',
  },
  {
    titulo: 'Premiación',
    texto:
      'La distribución de premios será: primer puesto 70% de lo recaudado, segundo puesto 20% de lo recaudado y tercer puesto 5% de lo recaudado.',
    emoji: '🥇',
  },
  {
    titulo: 'Empates',
    texto:
      'En caso de empate en posiciones premiadas, se sumarán los valores correspondientes a las posiciones involucradas y el total se dividirá equitativamente entre los participantes empatados.',
    emoji: '🤝',
  },
  {
    titulo: 'Corrección de errores',
    texto:
      'La administración podrá corregir errores evidentes de digitación.',
    emoji: '🛠️',
  },
  {
    titulo: 'Responsabilidad del participante',
    texto:
      'Cada participante debe verificar que sus pronósticos hayan quedado correctamente almacenados en la plataforma.',
    emoji: '✅',
  },
  {
    titulo: 'Espíritu de juego',
    texto:
      'La finalidad principal de la polla es disfrutar el Mundial, compartir entre amigos y mantener un ambiente de juego limpio, transparente y competitivo.',
    emoji: '🔥',
  },
]

export default function ReglasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-yellow-400 p-4 sm:p-6 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-400 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-5xl mb-2">📜⚽</div>

              <h1 className="text-3xl md:text-4xl font-black text-green-800">
                Reglamento oficial
              </h1>

              <p className="text-gray-700 mt-2 font-medium">
                Reglas claras para jugar, competir y evitar inconvenientes.
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
          <div className="bg-yellow-100 border border-yellow-400 rounded-3xl p-5 mb-6">
            <p className="text-xl font-black text-yellow-900 text-center">
              Al participar en La Polla del Mundial, cada usuario acepta estas reglas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reglas.map((regla, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-5 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{regla.emoji}</div>

                  <div>
                    <h2 className="text-xl font-black text-green-800 mb-2">
                      {index + 1}. {regla.titulo}
                    </h2>

                    <p className="text-gray-700 text-base leading-relaxed font-medium">
                      {regla.texto}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-green-100 border border-green-400 rounded-3xl p-6">
            <p className="text-xl font-black text-green-900 text-center">
              Después de 30 años… esta polla ya es tradición 😎⚽🔥
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}