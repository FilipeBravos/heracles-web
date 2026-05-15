import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AulaService, Aula } from '../../core/services/aula.service';
import { AulaFormComponent } from './aula-form/aula-form';
import { AulaDetalhesComponent } from './aula-detalhes/aula-detalhes';
import { AulaAlunosComponent } from './aula-alunos/aula-alunos';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDialogModule
],
  templateUrl: './agenda.html',
})
export class AgendaComponent implements OnInit {
  // 1. Transformamos o array em um Signal reativo!
  aulas = signal<Aula[]>([]);

  perfilUsuario: string | null = '';

  private aulaService = inject(AulaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.perfilUsuario = localStorage.getItem('tipoPerfil');
    this.carregarAulas();
  }

  carregarAulas() {
    this.aulaService.listarDisponiveis().subscribe({
      // 2. Usamos o .set() para atualizar o valor do Signal de forma segura
      next: (dados) => this.aulas.set(dados),
      error: (err) => console.error('Erro ao carregar aulas', err),
    });
  }

  reservarVaga(aula: Aula) {
    this.aulaService.reservar(aula.id).subscribe({
      next: (mensagem) => {
        this.snackBar.open(mensagem, 'Fechar', { duration: 4000 });
        this.carregarAulas();
      },
      error: (err) => {
        const msgErro = err.error || 'Erro ao realizar reserva.';
        this.snackBar.open(msgErro, 'Fechar', { duration: 4000 });
      },
    });
  }

  abrirModalNovaAula() {
    const dialogRef = this.dialog.open(AulaFormComponent, {
      width: '500px',
      panelClass: '!rounded-none',
    });

    dialogRef.afterClosed().subscribe((salvouComSucesso) => {
      if (salvouComSucesso) {
        this.carregarAulas();
      }
    });
  }

  abrirDetalhes(aula: Aula) {
    this.dialog.open(AulaDetalhesComponent, {
      data: aula,
      width: '500px',
      panelClass: '!rounded-2xl',
    });
  }

  abrirListaAlunos(aula: Aula) {
  this.dialog.open(AulaAlunosComponent, {
    data: aula,
    width: '450px',
    panelClass: '!rounded-2xl'
  });
}
}
