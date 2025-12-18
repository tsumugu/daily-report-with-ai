import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Followup,
  CreateFollowupRequest,
  FollowupItemsResponse,
  AddEpisodeRequest,
  AddActionRequest,
  EpisodesResponse,
  ActionsResponse,
} from '../models/followup.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FollowupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * フォロー項目一覧を取得
   */
  getFollowupItems(params: {
    status?: string;
    itemType?: 'goodPoint' | 'improvement';
    limit?: number;
    offset?: number;
  }): Observable<FollowupItemsResponse> {
    let httpParams = new HttpParams();
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.itemType) {
      httpParams = httpParams.set('itemType', params.itemType);
    }
    // limitとoffsetはデフォルト値を設定
    const limit = params.limit !== undefined ? params.limit : 20;
    const offset = params.offset !== undefined ? params.offset : 0;
    httpParams = httpParams.set('limit', limit.toString());
    httpParams = httpParams.set('offset', offset.toString());

    return this.http.get<FollowupItemsResponse>(`${this.baseUrl}/followups`, {
      params: httpParams,
    });
  }

  /**
   * よかったことのフォローアップ履歴を取得（後方互換性のため維持）
   */
  getGoodPointFollowups(goodPointId: string): Observable<Followup[]> {
    return this.http
      .get<{ data: Omit<Followup, 'userId' | 'itemType' | 'itemId' | 'updatedAt'>[] }>(
        `${this.baseUrl}/good-points/${goodPointId}/followups`
      )
      .pipe(
        map((response) =>
          response.data.map((item) => ({
            ...item,
            userId: '',
            itemType: 'goodPoint' as const,
            itemId: goodPointId,
            updatedAt: item.createdAt,
          }))
        )
      );
  }

  /**
   * よかったことのエピソード一覧を取得
   */
  getEpisodes(goodPointId: string): Observable<EpisodesResponse> {
    return this.http.get<EpisodesResponse>(
      `${this.baseUrl}/good-points/${goodPointId}/followups`
    );
  }

  /**
   * 改善点のフォローアップ履歴を取得（後方互換性のため維持）
   */
  getImprovementFollowups(improvementId: string): Observable<Followup[]> {
    return this.http
      .get<{ data: Omit<Followup, 'userId' | 'itemType' | 'itemId' | 'updatedAt'>[] }>(
        `${this.baseUrl}/improvements/${improvementId}/followups`
      )
      .pipe(
        map((response) =>
          response.data.map((item) => ({
            ...item,
            userId: '',
            itemType: 'improvement' as const,
            itemId: improvementId,
            updatedAt: item.createdAt,
          }))
        )
      );
  }

  /**
   * 改善点のアクション一覧を取得
   */
  getActions(improvementId: string): Observable<ActionsResponse> {
    return this.http.get<ActionsResponse>(
      `${this.baseUrl}/improvements/${improvementId}/followups`
      );
  }

  /**
   * よかったことにフォローアップを追加
   */
  addGoodPointFollowup(
    goodPointId: string,
    data: CreateFollowupRequest
  ): Observable<Followup> {
    return this.http.post<Followup>(
      `${this.baseUrl}/good-points/${goodPointId}/followups`,
      data
    );
  }

  /**
   * 改善点にフォローアップを追加（後方互換性のため維持）
   */
  addImprovementFollowup(
    improvementId: string,
    data: CreateFollowupRequest
  ): Observable<Followup> {
    return this.http.post<Followup>(
      `${this.baseUrl}/improvements/${improvementId}/followups`,
      data
    );
  }

  /**
   * よかったことにエピソードを追加（status不要）
   */
  addEpisode(goodPointId: string, data: AddEpisodeRequest): Observable<Followup> {
    return this.http.post<Followup>(
      `${this.baseUrl}/good-points/${goodPointId}/followups`,
      data
    );
  }

  /**
   * 改善点にアクションを追加（status不要）
   */
  addAction(improvementId: string, data: AddActionRequest): Observable<Followup> {
    return this.http.post<Followup>(
      `${this.baseUrl}/improvements/${improvementId}/followups`,
      data
    );
  }

  /**
   * エピソードを削除
   */
  deleteEpisode(goodPointId: string, followupId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/good-points/${goodPointId}/followups/${followupId}`
    );
  }

  /**
   * アクションを削除
   */
  deleteAction(improvementId: string, followupId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/improvements/${improvementId}/followups/${followupId}`
    );
  }

  /**
   * エピソードを更新
   */
  updateEpisode(
    goodPointId: string,
    followupId: string,
    data: AddEpisodeRequest
  ): Observable<Followup> {
    return this.http.put<Followup>(
      `${this.baseUrl}/good-points/${goodPointId}/followups/${followupId}`,
      data
    );
  }

  /**
   * アクションを更新
   */
  updateAction(
    improvementId: string,
    followupId: string,
    data: AddActionRequest
  ): Observable<Followup> {
    return this.http.put<Followup>(
      `${this.baseUrl}/improvements/${improvementId}/followups/${followupId}`,
      data
    );
  }
}
