import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DailyReportService } from './daily-report.service';
import { CreateDailyReportRequest, DailyReport } from '../models/daily-report.model';

describe('DailyReportService', () => {
  let service: DailyReportService;
  let httpMock: HttpTestingController;

  const mockDailyReport: DailyReport = {
    id: 'report-1',
    userId: 'user-1',
    date: '2025-12-05',
    events: 'テストイベント',
    learnings: 'テスト学び',
    goodPoints: [
      {
        id: 'gp-1',
        userId: 'user-1',
        content: 'よかったこと',
        factors: '要因',
        tags: [],
        status: '未対応',
        createdAt: '2025-12-05T00:00:00Z',
        updatedAt: '2025-12-05T00:00:00Z',
      },
    ],
    improvements: [
      {
        id: 'imp-1',
        userId: 'user-1',
        content: '改善点',
        action: 'アクション',
        status: '未着手',
        createdAt: '2025-12-05T00:00:00Z',
        updatedAt: '2025-12-05T00:00:00Z',
      },
    ],
    createdAt: '2025-12-05T00:00:00Z',
    updatedAt: '2025-12-05T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DailyReportService],
    });

    service = TestBed.inject(DailyReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('サービスが作成されること', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('日報を作成できること', () => {
      const request: CreateDailyReportRequest = {
        date: '2025-12-05',
        events: 'テストイベント',
        learnings: 'テスト学び',
        goodPoints: [{ content: 'よかったこと', factors: '要因' }],
        improvements: [{ content: '改善点', action: 'アクション' }],
      };

      service.create(request).subscribe((result) => {
        expect(result).toEqual(mockDailyReport);
      });

      const req = httpMock.expectOne('/api/daily-reports');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockDailyReport);
    });
  });

  describe('getAll', () => {
    it('日報一覧を取得できること', () => {
      const mockReports = [mockDailyReport];

      service.getAll().subscribe((result) => {
        expect(result).toEqual(mockReports);
      });

      const req = httpMock.expectOne('/api/daily-reports');
      expect(req.request.method).toBe('GET');
      req.flush(mockReports);
    });
  });

  describe('getAllWithPaging', () => {
    it('ページング付きで日報一覧を取得できること', () => {
      const mockReports = [mockDailyReport];

      service.getAllWithPaging(10, 5).subscribe((result) => {
        expect(result).toEqual(mockReports);
      });

      const req = httpMock.expectOne('/api/daily-reports?limit=10&offset=5');
      expect(req.request.method).toBe('GET');
      req.flush(mockReports);
    });
  });

  describe('getById', () => {
    it('指定IDの日報を取得できること', () => {
      service.getById('report-1').subscribe((result) => {
        expect(result).toEqual(mockDailyReport);
      });

      const req = httpMock.expectOne('/api/daily-reports/report-1');
      expect(req.request.method).toBe('GET');
      req.flush(mockDailyReport);
    });
  });

  describe('createGoodPoint', () => {
    it('よかったことを作成できること', () => {
      const request = { content: 'よかったこと', factors: '要因' };
      const mockGoodPoint = mockDailyReport.goodPoints[0];

      service.createGoodPoint(request).subscribe((result) => {
        expect(result).toEqual(mockGoodPoint);
      });

      const req = httpMock.expectOne('/api/good-points');
      expect(req.request.method).toBe('POST');
      req.flush(mockGoodPoint);
    });
  });

  describe('updateGoodPoint', () => {
    it('よかったことを更新できること', () => {
      const request = { status: '再現成功' as const };
      const updatedGoodPoint = { ...mockDailyReport.goodPoints[0], status: '再現成功' as const };

      service.updateGoodPoint('gp-1', request).subscribe((result) => {
        expect(result.status).toBe('再現成功');
      });

      const req = httpMock.expectOne('/api/good-points/gp-1');
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedGoodPoint);
    });
  });

  describe('createImprovement', () => {
    it('改善点を作成できること', () => {
      const request = { content: '改善点', action: 'アクション' };
      const mockImprovement = mockDailyReport.improvements[0];

      service.createImprovement(request).subscribe((result) => {
        expect(result).toEqual(mockImprovement);
      });

      const req = httpMock.expectOne('/api/improvements');
      expect(req.request.method).toBe('POST');
      req.flush(mockImprovement);
    });
  });

  describe('updateImprovement', () => {
    it('改善点を更新できること', () => {
      const request = { status: '完了' as const };
      const updatedImprovement = { ...mockDailyReport.improvements[0], status: '完了' as const };

      service.updateImprovement('imp-1', request).subscribe((result) => {
        expect(result.status).toBe('完了');
      });

      const req = httpMock.expectOne('/api/improvements/imp-1');
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedImprovement);
    });
  });
});

