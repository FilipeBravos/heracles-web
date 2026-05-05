import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-vincular-treino',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './vincular-treino.html'
})
export class VincularTreino implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  
  public dialogRef = inject(MatDialogRef<VincularTreino>);
  public data = inject(MAT_DIALOG_DATA);

  treinosDisponiveis = signal<any[]>([]);

  // Agora recebe um array de números (múltiplas escolhas), não tem required pois pode ficar vazio (desvincular)
  formVinculo = this.fb.group({
    treinosIds: [[] as number[]] 
  });

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/treinos').subscribe(dados => {
      this.treinosDisponiveis.set(dados);

      // Se o aluno já tem treinos, mapeamos os IDs para pré-selecionar as caixinhas
      if (this.data.aluno.treinos && this.data.aluno.treinos.length > 0) {
        const ids = this.data.aluno.treinos.map((t: any) => t.id);
        this.formVinculo.patchValue({ treinosIds: ids });
      }
    });
  }

  salvar() {
    const idsTreinosSelecionados = this.formVinculo.value.treinosIds || [];
    const idAluno = this.data.aluno.id;

    // Dispara para a nova rota que recebe o array de IDs
    this.http.put(`http://localhost:8080/api/usuarios/${idAluno}/treinos`, idsTreinosSelecionados)
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Erro ao sincronizar treinos', err)
      });
  }
}