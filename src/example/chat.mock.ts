import type { ChatResponse } from '../pages/Chat/interfaces/chat'

// Los chunk_id de este archivo son ficticios: solo sirven para probar la UI de citas.

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
const randomLatency = (min: number, max: number): number => Math.floor(min + Math.random() * (max - min))

interface Topic {
  keywords: RegExp
  respuesta: string
  retrieval_context: string[]
}

const TOPICS: Topic[] = [
  {
    keywords: /leo|sat[eé]lite|espacio|[oó]rbita|kessler/i,
    respuesta:
      'La congestión en órbita baja terrestre (LEO) aumenta el riesgo de colisiones en cascada, conocido como síndrome de Kessler [DOC-8e2d5f7a11-07]. Las megaconstelaciones como Starlink elevan la densidad de objetos rastreados y complican las maniobras de esquive [DOC-3c6a19f0d2-04].',
    retrieval_context: [
      '- [DOC-8e2d5f7a11-07] "La probabilidad de colisión en cascada en LEO se ha triplicado en la última década debido al crecimiento de constelaciones comerciales."',
      '- [DOC-3c6a19f0d2-04] "Los sistemas de vigilancia espacial actuales rastrean más de 30.000 objetos mayores a 10 cm en órbita baja."',
    ],
  },
  {
    keywords: /militar|aut[oó]nom|dron|arma/i,
    respuesta:
      'El uso militar de sistemas autónomos con inteligencia artificial plantea riesgos de pérdida de control humano significativo sobre decisiones letales [DOC-4f1a2b3c9d-03]. Varios foros internacionales debaten un marco regulatorio vinculante para estos sistemas [DOC-7d4e2a9b13-08].',
    retrieval_context: [
      '- [DOC-4f1a2b3c9d-03] "Los sistemas de armas autónomos letales reducen el tiempo de reacción humana en la cadena de decisión de ataque."',
      '- [DOC-7d4e2a9b13-08] "Naciones Unidas discute desde 2019 un instrumento vinculante sobre armas autónomas letales, sin consenso hasta la fecha."',
    ],
  },
  {
    keywords: /territ|colombia|latam|am[eé]rica latina|amazon/i,
    respuesta:
      'Las dinámicas territoriales en América Latina están marcadas por la presencia de economías ilegales que disputan el control de zonas de frontera, especialmente en la Amazonía [DOC-1a9c4e6b22-15]. Esto tensiona la gobernanza estatal en regiones periféricas [DOC-9b3f7d2e44-01].',
    retrieval_context: [
      '- [DOC-1a9c4e6b22-15] "El control territorial en la frontera amazónica colombiana está disputado entre economías ilegales y presencia estatal intermitente."',
      '- [DOC-9b3f7d2e44-01] "Varios países de la región han incorporado vehículos aéreos no tripulados para vigilancia fronteriza."',
    ],
  },
]

const GENERIC_RESPONSE =
  'Puedo ayudarte con preguntas sobre tres temas del corpus: inteligencia artificial militar, seguridad espacial en órbita baja (LEO) y dinámicas territoriales en América Latina. ¿Sobre cuál te gustaría profundizar?'

function pickTopic(pregunta: string): Topic | null {
  return TOPICS.find((t) => t.keywords.test(pregunta)) ?? null
}

/**
 * Simula `POST /chat` con un retardo de 1-2 s siguiendo el contrato real. Si
 * la pregunta contiene "error", devuelve `metadata.estado: 'error_interno_modelo'`
 * para probar ese estado en la UI. Los chunk_id citados son ficticios.
 */
export async function mockSendQuestion(pregunta: string): Promise<ChatResponse> {
  await wait(randomLatency(1000, 2000))

  if (/error/i.test(pregunta)) {
    return {
      respuesta:
        'No fue posible completar la consulta con el especialista principal. Esta es la mejor respuesta disponible: intenta reformular la pregunta o vuelve a intentarlo en unos minutos.',
      evaluacion: {
        input: pregunta,
        actual_output: 'Respuesta degradada por fallo del especialista.',
      },
      metadata: {
        estado: 'error_interno_modelo',
        num_interacciones: 1,
        agentes_invocados: ['orquestador'],
        tokens: { input: 210, output: 40, total: 250 },
        latencia_ms: randomLatency(400, 900),
      },
    }
  }

  const topic = pickTopic(pregunta)
  const respuesta = topic ? topic.respuesta : GENERIC_RESPONSE

  return {
    respuesta,
    evaluacion: {
      input: pregunta,
      actual_output: respuesta,
      ...(topic ? { retrieval_context: topic.retrieval_context } : {}),
      tools_called: topic
        ? [
            {
              nombre: 'buscar_en_indice_vectorial',
              parametros: { consulta: pregunta, top_k: topic.retrieval_context.length },
              salida: `${topic.retrieval_context.length} fragmentos recuperados`,
            },
          ]
        : [],
    },
    metadata: {
      estado: 'ok',
      num_interacciones: 2,
      agentes_invocados: ['orquestador', 'especialista_rag'],
      tokens: { input: 640, output: 260, total: 900 },
      latencia_ms: randomLatency(1200, 2800),
    },
  }
}
