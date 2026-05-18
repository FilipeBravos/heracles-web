import { Component, OnInit, inject, signal, computed } from '@angular/core'; // 🌟 Importado o computed
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs'; // 🌟 Adicionado para organizar em abas
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
    MatTabsModule // 🌟 Registrado aqui
  ],
  templateUrl: './agenda.html',
})
export class AgendaComponent implements OnInit {
  // Signal principal que armazena a lista bruta vinda da API
  aulas = signal<Aula[]>([]);

  // 🌟 SEPARAÇÃO REATIVA: Filtra automaticamente as aulas que são de hoje/futuro
  proximasAulas = computed(() => {
    const agora = new Date();
    return this.aulas().filter(aula => new Date(aula.dataHora) >= agora);
  });

  // 🌟 SEPARAÇÃO REATIVA: Filtra automaticamente as aulas que já passaram
  historicoAulas = computed(() => {
    const agora = new Date();
    return this.aulas().filter(aula => new Date(aula.dataHora) < agora);
  });

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