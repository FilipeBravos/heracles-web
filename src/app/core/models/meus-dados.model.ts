/**
 * O que o próprio usuário vê e edita de si mesmo, fora da ficha e da
 * matrícula: nome, telefone e senha.
 *
 * Menor de propósito que o cadastro completo de um aluno: e-mail e CPF
 * são identidade, não contato, e ficam fora da autoedição.
 */
export interface MeusDados {
  nome: string;
  email: string;
  telefone: string | null;
}

export interface AtualizarMeusDadosForm {
  nome: string;
  telefone: string | null;
}

export interface TrocarSenhaForm {
  senhaAtual: string;
  novaSenha: string;
}
