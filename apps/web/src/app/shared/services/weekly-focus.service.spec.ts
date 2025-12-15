import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { WeeklyFocusService } from './weekly-focus.service';
import {
  CreateWeeklyFocusRequest,
  WeeklyFocusResponse,
  WeeklyFocusesResponse,
} from '../models/weekly-focus.model';

describe('WeeklyFocusService', () => {
  let service: WeeklyFocusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeeklyFocusService],
    });
    service = TestBed.inject(WeeklyFocusService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCurrentWeekFocuses', () => {
    it('今週のフォーカスを取得できること', () => {
      const mockResponse: WeeklyFocusesResponse = {
        data: [
          {
            id: 'focus-1',
            userId: 'user-1',
            itemType: 'goodPoint',
            itemId: 'gp-1',
            goalId: null,
            weekStartDate: '2025-12-09',
            createdAt: '2025-12-09T12:00:00Z',
            item: {
              id: 'gp-1',
              content: 'テストよかったこと',
              status: '進行中',
              success_count: 0,
            },
            reportId: 'report-1',
          },
        ],
      };

      service.getCurrentWeekFocuses().subscribe((response) => {
        expect(response).toEqual(mockResponse.data);
      });

      const req = httpMock.expectOne('/api/weekly-focuses');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addWeeklyFocus', () => {
    it('週次フォーカスを設定できること', () => {
      const request: CreateWeeklyFocusRequest = {
        itemType: 'goodPoint',
        itemId: 'gp-1',
      };

      const mockResponse: WeeklyFocusResponse = {
        id: 'focus-1',
        userId: 'user-1',
        itemType: 'goodPoint',
        itemId: 'gp-1',
        goalId: null,
        weekStartDate: '2025-12-09',
        createdAt: '2025-12-09T12:00:00Z',
        item: {
          id: 'gp-1',
          content: 'テストよかったこと',
          status: '進行中',
          success_count: 0,
        },
        reportId: 'report-1',
      };

      service.addWeeklyFocus(request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/weekly-focuses');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('deleteWeeklyFocus', () => {
    it('週次フォーカスを削除できること', () => {
      let completed = false;
      service.deleteWeeklyFocus('focus-1').subscribe({
        next: () => {
          // void型なので値はない
        },
        complete: () => {
          completed = true;
        },
      });

      const req = httpMock.expectOne('/api/weekly-focuses/focus-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(completed).toBe(true);
    });
  });
});

