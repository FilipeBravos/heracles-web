import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { UsuarioService } from '../../core/services/usuario.service';
import { UnidadeService } from '../../core/services/unidade.service';
import { UsuarioFormComponent } from '../usuario/usuario-form/usuario-form';
import { UnidadeFormComponent } from '../unidade/unidade-form/unidade-form';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatTabsModule
  ],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800">Configurações da Rede</h2>
        <p class="text-gray-500">Gerencie suas filiais, acessos e permissões de funcionários.</p>
      </div>

      <mat-tab-group animationDuration="0ms" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        
        <mat-tab label="Gestão de Equipe">
          <div class="pt-6 px-4 pb-4">
            <div class="flex justify-end mb-6">
              <button mat-flat-button color="primary" class="!py-6 !px-6" (click)="abrirModalNovoUsuario()">
                <mat-icon>person_add</mat-icon> Novo Funcionário
              </button>
            </div>

            <div class="border border-gray-100 rounded-xl overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                    <th class="p-4 font-semibold">Nome</th>
                    <th class="p-4 font-semibold">E-mail (Login)</th>
                    <th class="p-4 font-semibold">Cargo / Perfil</th>
                    <th class="p-4 font-semibold">Status</th>
                    <th class="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (usuario of usuarios(); track usuario.id) {
                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td class="p-4 font-medium text-gray-800">{{ usuario.nome }}</td>
                      <td class="p-4 text-gray-600">{{ usuario.email }}</td>
                      <td class="p-4">
                        <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                          {{ usuario.tipoPerfil }}
                        </span>
                      </td>
                      <td class="p-4">
                        <span class="px-3 py-1 text-xs font-bold rounded-full" 
                              [ngClass]="usuario.status === 'ATIVO' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                          {{ usuario.status }}
                        </span>
                      </td>
                      <td class="p-4 text-right">
                        <button mat-icon-button color="warn" (click)="inativar(usuario.id)" title="Bloquear Acesso">
                          <mat-icon>block</mat-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              @if (usuarios().length === 0) {
                <div class="p-8 text-center text-gray-400">Nenhum funcionário cadastrado.</div>
              }
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Rede de Unidades">
          <div class="pt-6 px-4 pb-4">
            <div class="flex justify-end mb-6">
              <button mat-flat-button color="accent" class="!py-6 !px-6" (click)="abrirModalNovaUnidade()">
                <mat-icon>domain_add</mat-icon> Nova Filial
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (unidade of unidades(); track unidade.id) {
                <div class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-colors shadow-sm hover:shadow-md">
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-extrabold rounded-full tracking-wider">
                        {{ unidade.tipoModalidade }}
                      </span>
                      <span class="flex items-center gap-1 text-green-500 text-xs font-bold">
                        <mat-icon class="!w-4 !h-4 text-sm">check_circle</mat-icon> ATIVO
                      </span>
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-800">{{ unidade.nome }}</h3>
                    
                    <div class="mt-4 space-y-2">
                      <p class="text-sm text-gray-500 flex items-center gap-2">
                        <mat-icon class="!w-4 !h-4 text-gray-400">location_on</mat-icon> 
                        {{ unidade.endereco || 'Endereço não cadastrado' }}
                      </p>
                      <p class="text-sm text-gray-500 flex items-center gap-2">
                        <mat-icon class="!w-4 !h-4 text-gray-400">phone</mat-icon> 
                        {{ unidade.telefone || 'Sem telefone' }}
                      </p>
                    </div>
                  </div>
                </div>
              }

              @if (unidades().length === 0) {
                <div class="col-span-1 md:col-span-3 p-8 text-center text-gray-400">
                  Nenhuma unidade cadastrada. Crie sua primeira filial!
                </div>
              }
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `
})
export class ConfiguracoesComponent implements OnInit {
  private dialog = inject(MatDialog);
  private usuarioService = inject(UsuarioService);
  private unidadeService = inject(UnidadeService); // 🌟 NOVO SERVIÇO
  
  public usuarios = signal<any[]>([]);
  public unidades = signal<any[]>([]); // 🌟 NOVO SIGNAL PARA AS UNIDADES

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarUnidades(); // 🌟 CARREGA AS UNIDADES AO ABRIR A TELA
  }

  // --- LÓGICA DE USUÁRIOS ---
  carregarUsuarios() {
    this.usuarioService.listarTodos().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: (err) => console.error('Erro ao buscar usuários', err)
    });
  }

  abrirModalNovoUsuario() {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.carregarUsuarios(); 
      }
    });
  }

  inativar(id: number) {
    if (confirm('Tem certeza que deseja bloquear o acesso deste funcionário?')) {
      this.usuarioService.inativar(id).subscribe(() => this.carregarUsuarios());
    }
  }

  // --- LÓGICA DE UNIDADES ---
  carregarUnidades() {
    this.unidadeService.listarTodas().subscribe({
      next: (dados) => this.unidades.set(dados),
      error: (err) => console.error('Erro ao buscar unidades', err)
    });
  }

  abrirModalNovaUnidade() {
    const dialogRef = this.dialog.open(UnidadeFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        this.carregarUnidades(); // 🌟 RECARREGA A LISTA DE CARDS APÓS SALVAR
      }
    });
  }
}