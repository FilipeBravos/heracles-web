import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Anamnese,
  AnamneseForm,
  AvaliacaoFisica,
  AvaliacaoFisicaForm,
  ComparativoFisico,
  Contrato,
  EdicaoUsuario,
  NovoUsuario,
  Pagina,
  Usuario,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  listar(pagina = 0, tamanho = 20): Observable<Pagina<Usuario>> {
    const params = new HttpParams().set('page', pagina).set('size', tamanho);
    return this.http.get<Pagina<Usuario>>(this.url, { params });
  }

  criar(usuario: NovoUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, usuario);
  }

  atualizar(id: number, usuario: EdicaoUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, usuario);
  }

  alternarStatus(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/status`, {});
  }

  sincronizarTreinos(id: number, treinosIds: number[]): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}/treinos`, { treinosIds });
  }

  buscarAnamnese(id: number): Observable<Anamnese> {
    return this.http.get<Anamnese>(`${this.url}/${id}/anamnese`);
  }

  salvarAnamnese(id: number, anamnese: AnamneseForm): Observable<Anamnese> {
    return this.http.put<Anamnese>(`${this.url}/${id}/anamnese`, anamnese);
  }

  /**
   * Bytes da foto, para montar um object URL.
   *
   * Não dá para apontar um `<img src>` direto no endpoint: ele exige o
   * bearer token, que uma tag de imagem comum não envia — só o
   * HttpClient, via authInterceptor, faz isso.
   */
  buscarFoto(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/foto`, { responseType: 'blob' });
  }

  /** Histórico de avaliações físicas do aluno, mais recente primeiro. */
  historicoAvaliacoesFisicas(id: number): Observable<AvaliacaoFisica[]> {
    return this.http.get<AvaliacaoFisica[]>(`${this.url}/${id}/avaliacoes-fisicas`);
  }

  /** Registra uma avaliação nova — nunca edita uma existente. */
  registrarAvaliacaoFisica(id: number, avaliacao: AvaliacaoFisicaForm): Observable<AvaliacaoFisica> {
    return this.http.post<AvaliacaoFisica>(`${this.url}/${id}/avaliacoes-fisicas`, avaliacao);
  }

  /** Bytes de uma foto da galeria — mesmo motivo do object URL em buscarFoto(). */
  buscarFotoAvaliacaoFisica(id: number, avaliacaoId: number, fotoId: number): Observable<Blob> {
    return this.http.get(
      `${this.url}/${id}/avaliacoes-fisicas/${avaliacaoId}/fotos/${fotoId}`, { responseType: 'blob' });
  }

  /** A primeira avaliação contra a mais recente, ou duas escolhidas via deId/paraId. */
  compararAvaliacoesFisicas(id: number, deId?: number, paraId?: number): Observable<ComparativoFisico> {
    let params = new HttpParams();
    if (deId != null) params = params.set('deId', deId);
    if (paraId != null) params = params.set('paraId', paraId);
    return this.http.get<ComparativoFisico>(`${this.url}/${id}/avaliacoes-fisicas/comparativo`, { params });
  }

  /** O contrato assinado no cadastro — só leitura, não há edição. */
  buscarContrato(id: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.url}/${id}/contrato`);
  }
}
