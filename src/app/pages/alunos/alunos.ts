import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Usuario } from '../../core/models';
import { UsuarioService } from '../../core/services/usuario.service';
import { mensagemDeErro } from '../../core/services/erro-api';
import { AlunoFormComponent } from './aluno-form/aluno-form';
import { VincularTreinoComponent } from './vincular-treino/vincular-treino';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './alunos.html',
})
export class AlunosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['id', 'nome', 'cpf', 'email', 'treino', 'status', 'acoes'];

  readonly alunos = signal<Usuario[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly total = signal(0);
  readonly pagina = signal(0);
  readonly tamanhoPagina = signal(20);

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.usuarioService.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (pagina) => {
        this.alunos.set(pagina.content);
        this.total.set(pagina.totalElements);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os alunos.'));
        this.carregando.set(false);
      },
    });
  }

  mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanhoPagina.set(evento.pageSize);
    this.listar();
  }

  abrirModalNovoAluno(): void {
    this.abrirFormulario(null);
  }

  abrirModalEditarAluno(aluno: Usuario): void {
    this.abrirFormulario(aluno);
  }

  private abrirFormulario(aluno: Usuario | null): void {
    this.dialog
      .open(AlunoFormComponent, { width: '600px', panelClass: '!rounded-none', data: { aluno } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open(aluno ? 'Aluno atualizado.' : 'Aluno cadastrado.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  abrirModalVinculo(aluno: Usuario): void {
    this.dialog
      .open(VincularTreinoComponent, { width: '500px', panelClass: '!rounded-none', data: { aluno } })
      .afterClosed()
      .subscribe((salvou) => {
        if (salvou) {
          this.snackBar.open('Fichas atualizadas.', 'Fechar', { duration: 4000 });
          this.listar();
        }
      });
  }

  alternarStatus(aluno: Usuario): void {
    const acao = aluno.status === 'ATIVO' ? 'inativar' : 'reativar';
    if (!confirm(`Deseja realmente ${acao} o(a) aluno(a) ${aluno.nome}?`)) {
      return;
    }

    this.usuarioService.alternarStatus(aluno.id).subscribe({
      next: () => {
        this.snackBar.open(`Aluno ${acao === 'inativar' ? 'inativado' : 'reativado'}.`, 'Fechar', { duration: 4000 });
        this.listar();
      },
      // Antes isso ia so para o console.error e o usuario nao via nada.
      error: (erro) => this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 }),
    });
  }

  nomesDasFichas(aluno: Usuario): string {
    return aluno.treinos.map((treino) => treino.nome).join(', ');
  }
}
