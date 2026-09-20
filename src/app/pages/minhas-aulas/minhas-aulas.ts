import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AgendamentoPersonal, AulaGrupoParaAluno } from '../../core/models';
import { MinhasAulasService } from '../../core/services/agenda.service';
import { mensagemDeErro } from '../../core/services/erro-api';

/**
 * A agenda do aluno: aulas em grupo, que ele mesmo reserva ou cancela, e
 * sessões de personal, que ele só acompanha — quem agenda continua sendo
 * o balcão, a pedido dele.
 */
@Component({
  selector: 'app-minhas-aulas',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, DatePipe],
  templateUrl: './minhas-aulas.html',
})
export class MinhasAulasComponent implements OnInit {
  private readonly minhasAulasService = inject(MinhasAulasService);
  private readonly snackBar = inject(MatSnackBar);

  readonly aulas = signal<AulaGrupoParaAluno[]>([]);
  readonly carregandoAulas = signal(true);
  readonly erroAulas = signal<string | null>(null);
  /** Aula cuja reserva/cancelamento está em andamento — evita duplo clique. */
  readonly processando = signal<number | null>(null);

  readonly sessoesPersonal = signal<AgendamentoPersonal[]>([]);
  readonly carregandoPersonal = signal(true);
  readonly erroPersonal = signal<string | null>(null);

  ngOnInit(): void {
    this.listarAulas();
    this.listarSessoesPersonal();
  }

  listarAulas(): void {
    this.carregandoAulas.set(true);
    this.erroAulas.set(null);

    this.minhasAulasService.aulas(0, 50).subscribe({
      next: (pagina) => {
        this.aulas.set(pagina.content);
        this.carregandoAulas.set(false);
      },
      error: (erro) => {
        this.erroAulas.set(mensagemDeErro(erro, 'Não foi possível carregar as aulas.'));
        this.carregandoAulas.set(false);
      },
    });
  }

  listarSessoesPersonal(): void {
    this.carregandoPersonal.set(true);
    this.erroPersonal.set(null);

    this.minhasAulasService.sessoesPersonal(0, 50).subscribe({
      next: (pagina) => {
        this.sessoesPersonal.set(pagina.content);
        this.carregandoPersonal.set(false);
      },
      error: (erro) => {
        this.erroPersonal.set(mensagemDeErro(erro, 'Não foi possível carregar as sessões de personal.'));
        this.carregandoPersonal.set(false);
      },
    });
  }

  reservar(aula: AulaGrupoParaAluno): void {
    this.processando.set(aula.id);
    this.minhasAulasService.inscrever(aula.id).subscribe({
      next: () => {
        this.snackBar.open(`Vaga reservada em "${aula.nome}".`, 'Fechar', { duration: 4000 });
        this.processando.set(null);
        this.listarAulas();
      },
      error: (erro) => {
        this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 });
        this.processando.set(null);
      },
    });
  }

  cancelarReserva(aula: AulaGrupoParaAluno): void {
    if (!confirm(`Cancelar sua vaga em "${aula.nome}"?`)) return;

    this.processando.set(aula.id);
    this.minhasAulasService.cancelarInscricao(aula.id).subscribe({
      next: () => {
        this.snackBar.open('Vaga cancelada.', 'Fechar', { duration: 4000 });
        this.processando.set(null);
        this.listarAulas();
      },
      error: (erro) => {
        this.snackBar.open(mensagemDeErro(erro), 'Fechar', { duration: 6000 });
        this.processando.set(null);
      },
    });
  }

  /** Sem vaga e sem estar inscrito, reservar não adianta nada. */
  podeReservar(aula: AulaGrupoParaAluno): boolean {
    return !aula.inscrito && aula.vagasOcupadas < aula.capacidadeMaxima;
  }
}
