import { TipoPerfil } from './usuario.model';

export interface Credenciais {
  email: string;
  senha: string;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
}

export interface RespostaLogin {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuario: UsuarioAutenticado;
}
