import type { Conversation } from '../interfaces/conversation'

const DAY_MS = 24 * 60 * 60 * 1000

/** Conversaciones de ejemplo sobre los 3 fenómenos del corpus (IA militar, seguridad LEO, LATAM). */
export function buildMockConversations(now: number = Date.now()): Conversation[] {
  return [
    {
      id: 'mock-1',
      title: 'Riesgos de la militarización de la IA',
      createdAt: now - DAY_MS,
      messages: [
        {
          id: 'mock-1-1',
          role: 'user',
          text: '¿Qué riesgos plantea el uso de inteligencia artificial en sistemas de armas autónomos?',
        },
        {
          id: 'mock-1-2',
          role: 'ai',
          text: 'Los principales riesgos son la pérdida de control humano significativo, errores de identificación de objetivos y la escalada involuntaria de conflictos [DOC-4f1a2b3c9d-03].',
          sources: [{ id: 'DOC-4f1a2b3c9d-03', text: 'Informe sobre sistemas de armas autónomos letales' }],
        },
      ],
    },
    {
      id: 'mock-2',
      title: 'Congestión orbital en órbita baja',
      createdAt: now - DAY_MS,
      messages: [
        {
          id: 'mock-2-1',
          role: 'user',
          text: '¿Cómo afecta la basura espacial a los satélites en órbita LEO?',
        },
        {
          id: 'mock-2-2',
          role: 'ai',
          text: 'La congestión orbital en LEO aumenta el riesgo de colisiones en cascada (síndrome de Kessler), afectando la vida útil de constelaciones como Starlink [DOC-8e2d5f7a11-07].',
          sources: [{ id: 'DOC-8e2d5f7a11-07', text: 'Análisis de sostenibilidad orbital en LEO' }],
        },
      ],
    },
    {
      id: 'mock-3',
      title: 'Disputas territoriales en la Amazonía',
      createdAt: now - 4 * DAY_MS,
      messages: [
        {
          id: 'mock-3-1',
          role: 'user',
          text: '¿Qué dinámicas territoriales afectan a la región amazónica en Colombia?',
        },
        {
          id: 'mock-3-2',
          role: 'ai',
          text: 'La presencia de economías ilegales y grupos armados organizados redefine el control territorial en zonas de frontera amazónica [DOC-1a9c4e6b22-15].',
          sources: [{ id: 'DOC-1a9c4e6b22-15', text: 'Dinámicas territoriales en la Amazonía colombiana' }],
        },
      ],
    },
    {
      id: 'mock-4',
      title: 'Doctrina militar y drones en LATAM',
      createdAt: now - 6 * DAY_MS,
      messages: [
        {
          id: 'mock-4-1',
          role: 'user',
          text: '¿Qué países de Latinoamérica han incorporado drones militares en su doctrina de defensa?',
        },
        {
          id: 'mock-4-2',
          role: 'ai',
          text: 'Varios países de la región han adoptado vehículos aéreos no tripulados para vigilancia fronteriza y control territorial, con marcos regulatorios aún incipientes [DOC-9b3f7d2e44-01].',
          sources: [{ id: 'DOC-9b3f7d2e44-01', text: 'Doctrina de defensa y drones en América Latina' }],
        },
      ],
    },
  ]
}
