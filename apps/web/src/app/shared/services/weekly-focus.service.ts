import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  WeeklyFocusResponse,
  CreateWeeklyFocusRequest,
  WeeklyFocusesResponse,
} from '../models/weekly-focus.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeeklyFocusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * 今週のフォーカスを取得
   */
  getCurrentWeekFocuses(): Observable<WeeklyFocusResponse[]> {
    return this.http
      .get<WeeklyFocusesResponse>(`${this.baseUrl}/weekly-focuses`)
      .pipe(map((response) => response.data));
  }

  /**
   * 週次フォーカスを設定
   */
  addWeeklyFocus(
    data: CreateWeeklyFocusRequest
  ): Observable<WeeklyFocusResponse> {
    return this.http.post<WeeklyFocusResponse>(
      `${this.baseUrl}/weekly-focuses`,
      data
    );
  }

  /**
   * 週次フォーカスを削除
   */
  deleteWeeklyFocus(id: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/weekly-focuses/${id}`).pipe(
      map(() => undefined)
    );
  }
}
