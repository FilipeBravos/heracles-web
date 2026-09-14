/** Espelha DashboardResumoResponse: contagens reais, nao mais literais na tela. */
export interface ResumoDashboard {
  alunosAtivos: number;
  alunosInativos: number;
  treinosCadastrados: number;
  fichasAtribuidas: number;
  novasMatriculasNoMes: number;
  /** Aparelhos fora de operação agora. */
  equipamentosEmManutencao: number;
  produtosComEstoqueBaixo: number;
  vendasNoMes: number;
  faturamentoDoMes: number;
}
