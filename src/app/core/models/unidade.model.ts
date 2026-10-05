export type TipoUnidade = 'ACADEMIA' | 'CROSSFIT';

export interface Unidade {
  id: number;
  nome: string;
  tipo: TipoUnidade;
  endereco: string | null;
  telefone: string | null;
}

export interface UnidadeForm {
  nome: string;
  tipo: TipoUnidade;
  endereco: string | null;
  telefone: string | null;
}
