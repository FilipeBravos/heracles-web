import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Plano, TEXTO_CONTRATO_PADRAO, Usuario } from '../../../core/models';
import { PlanoService } from '../../../core/services/plano.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensagemDeErro } from '../../../core/services/erro-api';

export interface AlunoFormData {
  aluno: Usuario | null;
}

const TAMANHO_MAXIMO_FOTO_BYTES = 3 * 1024 * 1024;
const TIPOS_DE_FOTO_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './aluno-form.html',
})
export class AlunoFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly planoService = inject(PlanoService);

  readonly dialogRef = inject(MatDialogRef<AlunoFormComponent>);
  readonly data = inject<AlunoFormData>(MAT_DIALOG_DATA);

  readonly aluno = this.data?.aluno ?? null;
  readonly isEditMode = this.aluno !== null;
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly textoContrato = TEXTO_CONTRATO_PADRAO;

  readonly planos = signal<Plano[]>([]);

  // A foto nova fica fora do FormGroup: enquanto o usuário não troca, nada
  // é enviado no PUT, e a API preserva a foto que já existe.
  readonly fotoPreviewUrl = signal<string | null>(null);
  readonly erroFoto = signal<string | null>(null);
  private novaFotoBase64: string | null = null;
  private novaFotoContentType: string | null = null;
  private urlDeObjetoParaLiberar: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nome: [this.aluno?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
    cpf: [this.aluno?.cpf ?? '', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
    email: [this.aluno?.email ?? '', [Validators.required, Validators.email]],
    telefone: [this.aluno?.telefone ?? ''],
    endereco: [this.aluno?.endereco ?? '', [Validators.required, Validators.maxLength(255)]],
    cep: [this.aluno?.cep ?? '', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    dataNascimento: [this.aluno?.dataNascimento ?? '', Validators.required],
    planoEscolhidoId: [this.aluno?.planoEscolhidoId ?? (null as number | null), Validators.required],
    // Só no cadastro. A senha é enviada em claro sobre HTTPS e cifrada com
    // BCrypt no servidor — o formulário não monta mais nenhum hash.
    senha: ['', this.aluno ? [] : [Validators.required, Validators.minLength(8)]],
    // O "clique para assinar" do contrato — só no cadastro. Editar dados
    // depois não reabre um contrato já assinado.
    nomeAssinaturaContrato: ['', this.aluno ? [] : [Validators.required, Validators.maxLength(100)]],
    aceiteContrato: [false, this.aluno ? [] : [Validators.requiredTrue]],
  });

  ngOnInit(): void {
    const carregarPlanos = new Promise<void>((ok, falha) => {
      // Só planos em oferta: um plano fora de linha a API recusa na
      // escolha, oferecê-lo aqui seria um beco — exceto o que o aluno já
      // tem, para o select não ficar em branco ao editar.
      this.planoService.listar(0, 200, true).subscribe({
        next: (pagina) => {
          this.planos.set(pagina.content);
          ok();
        },
        error: falha,
      });
    });

    const carregarFotoAtual = this.aluno?.temFoto
      ? new Promise<void>((ok) => {
          this.usuarioService.buscarFoto(this.aluno!.id).subscribe({
            next: (blob) => {
              this.urlDeObjetoParaLiberar = URL.createObjectURL(blob);
              this.fotoPreviewUrl.set(this.urlDeObjetoParaLiberar);
              ok();
            },
            // Falha ao buscar a foto não impede editar o resto do cadastro.
            error: () => ok(),
          });
        })
      : Promise.resolve();

    Promise.all([carregarPlanos, carregarFotoAtual]).then(
      () => this.carregando.set(false),
      (erro) => {
        this.erro.set(mensagemDeErro(erro, 'Não foi possível carregar os planos disponíveis.'));
        this.carregando.set(false);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.urlDeObjetoParaLiberar) {
      URL.revokeObjectURL(this.urlDeObjetoParaLiberar);
    }
  }

  aoSelecionarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (!TIPOS_DE_FOTO_ACEITOS.includes(arquivo.type)) {
      this.erroFoto.set('A foto precisa ser JPEG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO_BYTES) {
      this.erroFoto.set('A foto excede o tamanho máximo de 3 MB.');
      input.value = '';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = leitor.result as string;
      const separador = resultado.indexOf(',');
      this.novaFotoBase64 = resultado.slice(separador + 1);
      this.novaFotoContentType = arquivo.type;

      if (this.urlDeObjetoParaLiberar) {
        URL.revokeObjectURL(this.urlDeObjetoParaLiberar);
        this.urlDeObjetoParaLiberar = null;
      }
      this.fotoPreviewUrl.set(resultado);
      this.erroFoto.set(null);
    };
    leitor.readAsDataURL(arquivo);
  }

  salvar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    const valores = this.form.getRawValue();
    const telefone = valores.telefone.trim() || null;

    const requisicao = this.aluno
      ? this.usuarioService.atualizar(this.aluno.id, {
          nome: valores.nome,
          cpf: valores.cpf,
          email: valores.email,
          telefone,
          endereco: valores.endereco,
          cep: valores.cep,
          dataNascimento: valores.dataNascimento,
          // null nos dois preserva a foto atual — só troca quando o
          // usuário de fato escolheu um arquivo novo.
          fotoBase64: this.novaFotoBase64,
          fotoContentType: this.novaFotoContentType,
          planoEscolhidoId: valores.planoEscolhidoId,
        })
      : this.usuarioService.criar({
          nome: valores.nome,
          cpf: valores.cpf,
          email: valores.email,
          telefone,
          endereco: valores.endereco,
          cep: valores.cep,
          dataNascimento: valores.dataNascimento,
          fotoBase64: this.novaFotoBase64,
          fotoContentType: this.novaFotoContentType,
          planoEscolhidoId: valores.planoEscolhidoId,
          // O perfil é fixo no cliente, mas quem decide de verdade é a API:
          // só ADMIN e SECRETARIA conseguem chamar esta rota.
          tipoPerfil: 'ALUNO',
          senha: valores.senha,
          nomeAssinaturaContrato: valores.nomeAssinaturaContrato,
          aceiteContrato: valores.aceiteContrato,
        });

    requisicao.subscribe({
      next: () => this.dialogRef.close(true),
      error: (erro) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar o aluno.'));
      },
    });
  }
}
