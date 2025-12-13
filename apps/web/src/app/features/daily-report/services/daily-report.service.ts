import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DailyReport,
  CreateDailyReportRequest,
  GoodPoint,
  Improvement,
  GoodPointStatus,
  ImprovementStatus,
} from '../models/daily-report.model';
import { ReportCardData } from '../../../shared/components/report-card/report-card.component';

@Injectable({
  providedIn: 'root',
})
export class DailyReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  /**
   * 日報を作成
   */
  create(request: CreateDailyReportRequest): Observable<DailyReport> {
    return this.http.post<DailyReport>(`${this.baseUrl}/daily-reports`, request);
  }

  /**
   * 日報一覧を取得
   */
  getAll(): Observable<{ data: ReportCardData[]; total: number }> {
    return this.http.get<{ data: ReportCardData[]; total: number }>(`${this.baseUrl}/daily-reports`);
  }

  /**
   * 日報一覧を取得（ページング対応）
   */
  getAllWithPaging(limit: number, offset: number): Observable<{ data: ReportCardData[]; total: number }> {
    return this.http.get<{ data: ReportCardData[]; total: number }>(
      `${this.baseUrl}/daily-reports?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * 日報詳細を取得
   */
  getById(id: string): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.baseUrl}/daily-reports/${id}`);
  }

  /**
   * 日報を更新
   */
  update(id: string, request: CreateDailyReportRequest): Observable<DailyReport> {
    return this.http.put<DailyReport>(`${this.baseUrl}/daily-reports/${id}`, request);
  }

  /**
   * よかったことを作成
   */
  createGoodPoint(request: {
    content: string;
    factors?: string;
    tags?: string[];
  }): Observable<GoodPoint> {
    return this.http.post<GoodPoint>(`${this.baseUrl}/good-points`, request);
  }

  /**
   * よかったことを更新
   */
  updateGoodPoint(
    id: string,
    request: {
      content?: string;
      factors?: string;
      tags?: string[];
      status?: GoodPointStatus;
    }
  ): Observable<GoodPoint> {
    return this.http.patch<GoodPoint>(`${this.baseUrl}/good-points/${id}`, request);
  }

  /**
   * 改善点を作成
   */
  createImprovement(request: { content: string; action?: string }): Observable<Improvement> {
    return this.http.post<Improvement>(`${this.baseUrl}/improvements`, request);
  }

  /**
   * 改善点を更新
   */
  updateImprovement(
    id: string,
    request: {
      content?: string;
      action?: string;
      status?: ImprovementStatus;
    }
  ): Observable<Improvement> {
    return this.http.patch<Improvement>(`${this.baseUrl}/improvements/${id}`, request);
  }
}
