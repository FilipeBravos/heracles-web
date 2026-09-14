import { TreinoResumo } from './treino.model';

export type TipoPerfil = 'ALUNO' | 'PROFESSOR' | 'SECRETARIA' | 'ADMIN';
export type StatusUsuario = 'ATIVO' | 'INATIVO';

/** Espelha UsuarioResponse na API. Nao existe campo de senha, de proposito. */
export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  tipoPerfil: TipoPerfil;
  status: StatusUsuario;
  dataCadastro: string;
  treinos: TreinoResumo[];
}

/** Espelha UsuarioRequests.Criar. */
export interface NovoUsuario {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  tipoPerfil: TipoPerfil;
  senha: string;
}

/** Espelha UsuarioRequests.Atualizar — sem perfil e sem status, que nao sao editaveis por aqui. */
export interface EdicaoUsuario {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
}
