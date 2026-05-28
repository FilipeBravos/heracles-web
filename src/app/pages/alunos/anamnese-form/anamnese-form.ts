import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';

import { AnamneseService } from '../../../core/services/anamnese.service';

@Component({
  selector: 'app-anamnese-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, 
    MatInputModule, MatSelectModule, MatCheckboxModule, MatIconModule, MatTabsModule
  ],
  templateUrl: './anamnese-form.html'
})
export class AnamneseForm implements OnInit {
  private dialogRef = inject(MatDialogRef<AnamneseForm>);
  private anamneseService = inject(AnamneseService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { aluno: any }) {}

  public isEdicao = signal<boolean>(false);

  // Objeto base vazio
  public anamnese: any = {
    usuarioId: null,
    avaliador: '',
    contatoEmergencia: '',
    objetivos: '',
    prazoObjetivo: '',
    praticaAtividade: false,
    tempoParado: '',
    experienciaMusculacao: '',
    frequenciaSemanal: '',
    doencasCronicas: '',
    problemasCardiacos: '',
    doresLesoes: '',
    cirurgias: '',
    medicamentos: '',
    posturaCabeca: '',
    posturaOmbros: '',
    posturaColuna: '',
    posturaQuadril: '',
    posturaJoelhos: '',
    posturaPes: '',
    qualidadeSono: '',
    nivelEstresse: '',
    ingestaoAgua: '',
    termoAssinado: false,
    observacoesFinais: ''
  };

  ngOnInit() {
    this.anamnese.usuarioId = this.data.aluno.id;

    this.anamneseService.buscarHistoricoAluno(this.data.aluno.id).subscribe({
      next: (historico) => {
        if (historico && historico.length > 0) {
          this.anamnese = { ...historico[0] };
          this.isEdicao.set(true);
        }
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar histórico', err)
    });
  }

  salvar() {
    if (!this.anamnese.termoAssinado) {
      alert('É necessário confirmar o termo de responsabilidade na última aba.');
      return;
    }

    if (this.isEdicao()) {
      //Atualiza a ficha existente
      this.anamneseService.atualizar(this.anamnese.id, this.anamnese).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao atualizar', err)
      });
    } else {
      //Cria uma nova ficha
      this.anamneseService.salvar(this.anamnese).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err: HttpErrorResponse) => console.error('Erro ao salvar', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}