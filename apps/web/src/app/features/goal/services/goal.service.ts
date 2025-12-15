import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Goal,
  GoalDetailResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalsResponse,
} from '../models/goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/goals';

  /**
   * 目標一覧を取得する
   * @param hierarchy 階層構造を含めるかどうか（デフォルト: true）
   */
  getGoals(hierarchy = true): Observable<GoalsResponse> {
    const params = hierarchy ? { hierarchy: 'true' } : { hierarchy: 'false' };
    return this.http.get<GoalsResponse>(this.apiUrl, { params });
  }

  /**
   * 目標詳細を取得する
   */
  getGoal(id: string): Observable<GoalDetailResponse> {
    return this.http.get<GoalDetailResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * 目標を作成する
   */
  createGoal(request: CreateGoalRequest): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, request);
  }

  /**
   * 目標を更新する
   */
  updateGoal(id: string, request: UpdateGoalRequest): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * 目標を削除する
   */
  deleteGoal(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

