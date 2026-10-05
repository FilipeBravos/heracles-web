/** Espelha DashboardResumoResponse: contagens reais, nao mais literais na tela. */
export interface ResumoDashboard {
  alunosAtivos: number;
  alunosInativos: number;
  treinosCadastrados: number;
  fichasAtribuidas: number;
  /** Matrículas de fato iniciadas no mês — antes era a contagem de cadastros. */
  novasMatriculasNoMes: number;
  /** Matrículas em atraso de pagamento: a fila de cobrança. */
  matriculasInadimplentes: number;
  /** Vigentes que já passaram do vencimento: o acesso caiu hoje. */
  matriculasVencidas: number;
  /** Aparelhos fora de operação agora. */
  equipamentosEmManutencao: number;
  produtosComEstoqueBaixo: number;
  vendasNoMes: number;
  faturamentoDoMes: number;
}
