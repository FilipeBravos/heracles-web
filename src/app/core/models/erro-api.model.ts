/** Corpo de erro no formato ProblemDetail (RFC 9457) devolvido pela API. */
export interface ErroApi {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  erros?: Record<string, string>;
}
