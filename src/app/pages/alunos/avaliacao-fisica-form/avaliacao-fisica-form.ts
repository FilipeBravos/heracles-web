import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-avaliacao-fisica-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, 
    MatInputModule, MatSelectModule, MatIconModule, MatTabsModule
  ],
  templateUrl: './avaliacao-fisica-form.html'
})
export class AvaliacaoFisicaForm implements OnInit {
  private dialogRef = inject(MatDialogRef<AvaliacaoFisicaForm>);
  private http = inject(HttpClient);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { aluno: any }) {}

  public isEdicao = signal<boolean>(false);

  // Estrutura completa mapeada para o modelo antropométrico
  public avaliacao: any = {
    id: null,
    usuarioId: null,
    avaliador: '',
    dataAvaliacao: new Date().toISOString().substring(0, 10),
    
    // Antropometria
    peso: null,
    altura: null,
    circAbdominalAntropo: null,
    circQuadrilAntropo: null,
    protocoloPercentual: '',
    percentualGordura: null,
    pesoGordo: null,
    pesoMagro: null,

    // Perimetria (cm)
    bracoRelaxadoD: null, bracoRelaxadoE: null,
    bracoContraidoD: null, bracoContraidoE: null,
    antebracoD: null, antebracoE: null,
    torax: null,
    cintura: null,
    abdomen: null,
    quadril: null,
    coxaProximalD: null, coxaProximalE: null,
    coxaMedialD: null, coxaMedialE: null,
    panturrilhaD: null, panturrilhaE: null,

    // Dobras Cutâneas (mm)
    protocoloDobras: '',
    triceps1: null, triceps2: null, triceps3: null,
    subescapular1: null, subescapular2: null, subescapular3: null,
    peitoral1: null, peitoral2: null, peitoral3: null,
    axilar1: null, axilar2: null, axilar3: null,
    supraIliaca1: null, supraIliaca2: null, supraIliaca3: null,
    abdominal1: null, abdominal2: null, abdominal3: null,
    coxa1: null, coxa2: null, coxa3: null
  };

  ngOnInit() {
    this.avaliacao.usuarioId = this.data.aluno.id;
    this.carregarUltimaAvaliacao();
  }

  carregarUltimaAvaliacao() {
    this.http.get<any[]>(`http://localhost:8080/api/avaliacoes/aluno/${this.data.aluno.id}`).subscribe({
      next: (historico) => {
        if (historico && historico.length > 0) {
          this.avaliacao = { ...historico[0] };
          this.isEdicao.set(true);
        }
      },
      error: (err: HttpErrorResponse) => console.error('Erro ao buscar avaliações anteriores', err)
    });
  }

  // 🌟 CÁLCULO AUTOMÁTICO: IMC
  get imc(): string {
    if (this.avaliacao.peso && this.avaliacao.altura) {
      const altMetros = this.avaliacao.altura / 100;
      return (this.avaliacao.peso / (altMetros * altMetros)).toFixed(2);
    }
    return '0.00';
  }

  // 🌟 CÁLCULO AUTOMÁTICO: Relação Cintura-Quadril (RCQ)
  get rcq(): string {
    if (this.avaliacao.cintura && this.avaliacao.quadril) {
      return (this.avaliacao.cintura / this.avaliacao.quadril).toFixed(2);
    }
    return '0.00';
  }

// 🌟 CÁLCULO AUTOMÁTICO: Média aritmética das 3 tomadas de dobras
  calcularMediaDobra(v1: any, v2: any, v3: any): string {
    // Agora o TypeScript permite verificar se o Angular mandou uma string vazia no input
    const valores = [v1, v2, v3].filter(v => v !== null && v !== undefined && v !== '');
    
    if (valores.length === 0) return '0.0';
    
    const soma = valores.reduce((acc, curr) => acc + Number(curr), 0);
    return (soma / valores.length).toFixed(1);
  }

  salvar() {
    const url = 'http://localhost:8080/api/avaliacoes';
    
    // Injeta os valores calculados antes de disparar o JSON para a API
    this.avaliacao.imc = this.imc;
    this.avaliacao.rcq = this.rcq;

    if (this.isEdicao()) {
      this.http.put(`${url}/${this.avaliacao.id}`, this.avaliacao).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Erro ao atualizar avaliação', err)
      });
    } else {
      this.http.post(url, this.avaliacao).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Erro ao criar avaliação', err)
      });
    }
  }

  fechar() {
    this.dialogRef.close(false);
  }
}