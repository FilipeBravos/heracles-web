import { HttpErrorResponse } from '@angular/common/http';

import { ErroApi } from '../models';

/**
 * Extrai uma mensagem legivel do ProblemDetail devolvido pela API.
 *
 * Antes os erros so chegavam ao console.error, entao uma falha de gravacao
 * era invisivel para quem estava usando o sistema — foi exatamente assim que
 * o POST de treino quebrado passou despercebido.
 */
export function mensagemDeErro(erro: unknown, padrao = 'Nao foi possivel completar a operacao.'): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return padrao;
  }

  if (erro.status === 0) {
    return 'Nao foi possivel falar com o servidor. Verifique sua conexao.';
  }

  const corpo = erro.error as ErroApi | null;

  // Erros de validacao trazem um mapa campo -> mensagem.
  if (corpo?.erros) {
    const mensagens = Object.values(corpo.erros);
    if (mensagens.length > 0) {
      return mensagens.join(' ');
    }
  }

  return corpo?.detail ?? corpo?.title ?? padrao;
}
