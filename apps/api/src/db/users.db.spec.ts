import { describe, it, expect, beforeEach } from 'vitest';
import { usersDb } from './users.db';
import { User } from '../models/user.model';

describe('UsersDatabase', () => {
  beforeEach(() => {
    usersDb.clear();
  });

  const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: '1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe('save', () => {
    it('ユーザーを保存して返すこと', () => {
      const user = createMockUser();
      const result = usersDb.save(user);

      expect(result).toEqual(user);
    });

    it('同じIDで上書き保存できること', () => {
      const user1 = createMockUser({ email: 'old@example.com' });
      usersDb.save(user1);

      const user2 = createMockUser({ email: 'new@example.com' });
      usersDb.save(user2);

      const found = usersDb.findById('1');
      expect(found?.email).toBe('new@example.com');
    });
  });

  describe('findById', () => {
    it('存在するユーザーを返すこと', () => {
      const user = createMockUser();
      usersDb.save(user);

      const found = usersDb.findById('1');
      expect(found).toEqual(user);
    });

    it('存在しないIDの場合、undefinedを返すこと', () => {
      const found = usersDb.findById('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('存在するメールアドレスのユーザーを返すこと', () => {
      const user = createMockUser();
      usersDb.save(user);

      const found = usersDb.findByEmail('test@example.com');
      expect(found).toEqual(user);
    });

    it('存在しないメールアドレスの場合、undefinedを返すこと', () => {
      const found = usersDb.findByEmail('nonexistent@example.com');
      expect(found).toBeUndefined();
    });

    it('複数ユーザーから正しいユーザーを返すこと', () => {
      usersDb.save(createMockUser({ id: '1', email: 'user1@example.com' }));
      usersDb.save(createMockUser({ id: '2', email: 'user2@example.com' }));
      usersDb.save(createMockUser({ id: '3', email: 'user3@example.com' }));

      const found = usersDb.findByEmail('user2@example.com');
      expect(found?.id).toBe('2');
    });
  });

  describe('existsByEmail', () => {
    it('メールアドレスが存在する場合、trueを返すこと', () => {
      usersDb.save(createMockUser());

      const exists = usersDb.existsByEmail('test@example.com');
      expect(exists).toBe(true);
    });

    it('メールアドレスが存在しない場合、falseを返すこと', () => {
      const exists = usersDb.existsByEmail('nonexistent@example.com');
      expect(exists).toBe(false);
    });
  });

  describe('findAll', () => {
    it('空の場合、空配列を返すこと', () => {
      const all = usersDb.findAll();
      expect(all).toEqual([]);
    });

    it('全ユーザーを返すこと', () => {
      usersDb.save(createMockUser({ id: '1', email: 'user1@example.com' }));
      usersDb.save(createMockUser({ id: '2', email: 'user2@example.com' }));

      const all = usersDb.findAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('全ユーザーを削除すること', () => {
      usersDb.save(createMockUser({ id: '1' }));
      usersDb.save(createMockUser({ id: '2' }));

      usersDb.clear();

      const all = usersDb.findAll();
      expect(all).toHaveLength(0);
    });
  });
});

