import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Followup,
  CreateFollowupRequest,
  FollowupItemsResponse,
} from '../models/followup.model';

@Injectable({
  providedIn: 'root',
})
export class FollowupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

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
   * よかったことのフォローアップ履歴を取得
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
   * 改善点のフォローアップ履歴を取得
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
   * 改善点にフォローアップを追加
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
}
