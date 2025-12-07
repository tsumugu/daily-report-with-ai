import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FollowupService } from './followup.service';
import {
  Followup,
  CreateFollowupRequest,
  FollowupItemsResponse,
} from '../models/followup.model';

describe('FollowupService', () => {
  let service: FollowupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FollowupService],
    });
    service = TestBed.inject(FollowupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getFollowupItems', () => {
    it('フォロー項目一覧を取得できること', () => {
      const mockResponse: FollowupItemsResponse = {
        data: [
          {
            itemType: 'goodPoint',
            item: {
              id: 'gp-1',
              content: 'テストよかったこと',
              status: '進行中',
              success_count: 1,
              createdAt: '2025-12-05T12:00:00Z',
            },
            reportDate: '2025-12-05',
            reportId: 'report-1',
          },
        ],
        total: 1,
      };

      service
        .getFollowupItems({ status: '進行中', itemType: 'goodPoint' })
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/followups' &&
          request.params.get('status') === '進行中' &&
          request.params.get('itemType') === 'goodPoint'
        );
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('パラメータが未指定の場合、デフォルト値でリクエストすること', () => {
      const mockResponse: FollowupItemsResponse = {
        data: [],
        total: 0,
      };

      service.getFollowupItems({}).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/followups' &&
          request.params.has('limit') &&
          request.params.has('offset')
        );
      });
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('limit')).toBe('20');
      expect(req.request.params.get('offset')).toBe('0');
      req.flush(mockResponse);
    });

    it('limitとoffsetが指定された場合、指定値でリクエストすること', () => {
      const mockResponse: FollowupItemsResponse = {
        data: [],
        total: 0,
      };

      service.getFollowupItems({ limit: 10, offset: 5 }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/followups' &&
          request.params.get('limit') === '10' &&
          request.params.get('offset') === '5'
        );
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getGoodPointFollowups', () => {
    it('よかったことのフォローアップ履歴を取得できること', () => {
      const mockResponse = {
        data: [
          {
            id: 'followup-1',
            status: '再現成功' as const,
            memo: 'テストメモ',
            date: '2025-12-10',
            createdAt: '2025-12-10T12:00:00Z',
          },
        ],
      };

      service.getGoodPointFollowups('gp-1').subscribe((response) => {
        expect(response.length).toBe(1);
        expect(response[0].id).toBe('followup-1');
        expect(response[0].status).toBe('再現成功');
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getImprovementFollowups', () => {
    it('改善点のフォローアップ履歴を取得できること', () => {
      const mockResponse = {
        data: [
          {
            id: 'followup-1',
            status: '完了' as const,
            memo: 'テストメモ',
            date: '2025-12-10',
            createdAt: '2025-12-10T12:00:00Z',
          },
        ],
      };

      service.getImprovementFollowups('imp-1').subscribe((response) => {
        expect(response.length).toBe(1);
        expect(response[0].id).toBe('followup-1');
        expect(response[0].status).toBe('完了');
      });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addGoodPointFollowup', () => {
    it('よかったことにフォローアップを追加できること', () => {
      const request: CreateFollowupRequest = {
        status: '再現成功',
        memo: 'テストメモ',
        date: '2025-12-10',
      };

      const mockResponse: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service.addGoodPointFollowup('gp-1', request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('addImprovementFollowup', () => {
    it('改善点にフォローアップを追加できること', () => {
      const request: CreateFollowupRequest = {
        status: '完了',
        memo: 'テストメモ',
        date: '2025-12-10',
      };

      const mockResponse: Followup = {
        id: 'followup-1',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service
        .addImprovementFollowup('imp-1', request)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });
});

