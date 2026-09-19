/**
 * Contrato real de `POST /chat`. El backend responde siempre HTTP 200, incluso
 * en errores: `metadata.estado !== 'ok'` indica el caso de error (ver §2.4 en
 * `../ARQUITECTURA_SOLUCION.md`).
 */

/** Cuerpo de `POST /chat`. */
export interface ChatRequest {
  pregunta: string
}

/** Consumo de tokens de una llamada al modelo. */
export interface TokenUsage {
  input: number
  output: number
  total: number
}

/** Respuesta de `POST /chat`. Campos en español porque así los envía el backend (regla 8). */
export interface ChatResponse {
  respuesta: string
  evaluacion?: {
    input: string
    actual_output: string
    /** Líneas `- [chunk_id] fragmento`; ausente si no hubo búsqueda. */
    retrieval_context?: string[]
    /** Forma desconocida: cada elemento se trata como opaco. */
    tools_called?: unknown[]
  }
  metadata: {
    estado: string
    num_interacciones?: number
    agentes_invocados?: string[]
    tokens?: TokenUsage
    latencia_ms?: number
  }
}

/** Fragmento citado de `evaluacion.retrieval_context`: id del chunk y texto. */
export interface Source {
  id: string
  text: string
}
