/**
 * O contrato de adesão assinado eletronicamente no cadastro do aluno.
 *
 * Substitui "só senha inicial" como o momento de aceite. `assinado` sai
 * sempre true quando há um contrato — cadastros anteriores a esta
 * funcionalidade não têm um, e isso é normal, não erro.
 */
export interface Contrato {
  assinado: boolean;
  nomeDigitado: string | null;
  textoContrato: string | null;
  assinadoEm: string | null;
}

/**
 * Texto do contrato mostrado no cadastro — mesmo texto vigente no backend
 * (UsuarioService.TEXTO_CONTRATO_PADRAO). Duplicado de propósito: não há
 * endpoint de modelo de contrato nesta entrega, só o de assinatura.
 */
export const TEXTO_CONTRATO_PADRAO = `CONTRATO DE ADESAO - HERACLES ACADEMIA

Ao assinar este contrato, o(a) aluno(a) concorda com as condicoes gerais de uso das instalacoes e servicos da unidade, incluindo o pagamento pontual da mensalidade do plano escolhido, o uso adequado dos equipamentos e o respeito as normas internas de convivencia e seguranca. A academia se compromete a manter as instalacoes em condicoes adequadas de uso e a prestar os servicos contratados com qualidade.`;
