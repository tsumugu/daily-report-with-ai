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
  AddEpisodeRequest,
  AddActionRequest,
  EpisodesResponse,
  ActionsResponse,
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

  describe('getEpisodes', () => {
    it('よかったことのエピソード一覧を取得できること', () => {
      const mockResponse: EpisodesResponse = {
        data: [
          {
            id: 'episode-1',
            date: '2025-12-10',
            memo: 'テストメモ',
            createdAt: '2025-12-10T12:00:00Z',
          },
        ],
        count: 1,
        status: '進行中',
      };

      service.getEpisodes('gp-1').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.count).toBe(1);
        expect(response.status).toBe('進行中');
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getActions', () => {
    it('改善点のアクション一覧を取得できること', () => {
      const mockResponse: ActionsResponse = {
        data: [
          {
            id: 'action-1',
            date: '2025-12-10',
            memo: 'テストメモ',
            createdAt: '2025-12-10T12:00:00Z',
          },
        ],
        count: 1,
        status: '進行中',
      };

      service.getActions('imp-1').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.count).toBe(1);
        expect(response.status).toBe('進行中');
      });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addEpisode', () => {
    it('よかったことにエピソードを追加できること', () => {
      const request: AddEpisodeRequest = {
        date: '2025-12-10',
        memo: 'テストメモ',
      };

      const mockResponse: Followup = {
        id: 'episode-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service.addEpisode('gp-1', request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('memoが未指定の場合も動作すること', () => {
      const request: AddEpisodeRequest = {
        date: '2025-12-10',
      };

      const mockResponse: Followup = {
        id: 'episode-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        status: '再現成功',
        memo: null,
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service.addEpisode('gp-1', request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('addAction', () => {
    it('改善点にアクションを追加できること', () => {
      const request: AddActionRequest = {
        date: '2025-12-10',
        memo: 'テストメモ',
      };

      const mockResponse: Followup = {
        id: 'action-1',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: 'テストメモ',
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service.addAction('imp-1', request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('memoが未指定の場合も動作すること', () => {
      const request: AddActionRequest = {
        date: '2025-12-10',
      };

      const mockResponse: Followup = {
        id: 'action-1',
        userId: 'user-1',
        itemType: 'improvement',
        itemId: 'imp-1',
        status: '完了',
        memo: null,
        date: '2025-12-10',
        createdAt: '2025-12-10T12:00:00Z',
        updatedAt: '2025-12-10T12:00:00Z',
      };

      service.addAction('imp-1', request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('deleteEpisode', () => {
    it('エピソードを削除できること', () => {
      service.deleteEpisode('gp-1', 'episode-1').subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne('/api/good-points/gp-1/followups/episode-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('deleteAction', () => {
    it('アクションを削除できること', () => {
      service.deleteAction('imp-1', 'action-1').subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne('/api/improvements/imp-1/followups/action-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

