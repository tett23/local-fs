import localKVS, { KVS } from '../src/index';
import 'fake-indexeddb';

async function kvsInstance() {
  const kvs = await localKVS(indexedDB);
  if (kvs instanceof Error) {
    throw kvs;
  }
  const clearResult = await kvs.clear();
  if (clearResult instanceof Error) {
    throw clearResult;
  }

  return kvs;
}

describe('KVS', () => {
  let kvs: KVS;
  beforeEach(async () => {
    kvs = await kvsInstance();
  });

  describe('put', () => {
    it('puts any value', async () => {
      const result = await kvs.put('foo', 'bar');
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(true);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      const result = await kvs.put('foo', 'bar');
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toBe(true);
    });

    it('get any value', async () => {
      const value = await kvs.get('foo');
      expect(value).toBe('bar');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await kvs.put('key1', 'foo');
      await kvs.put('key2', 'bar');
    });

    it('delete a value', async () => {
      expect(await kvs.delete('key1')).toBe(true);
      expect(await kvs.get('key1')).toBe(undefined);
      expect(await kvs.keys()).toEqual(['key2']);
      expect(await kvs.delete('does_not_exist')).toBe(true);
    });
  });

  describe('keys', () => {
    beforeEach(async () => {
      await kvs.put('key1', 'foo');
      await kvs.put('key2', 'bar');
    });

    it('delete any value', async () => {
      expect(await kvs.keys()).toEqual(['key1', 'key2']);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await kvs.put('key1', 'foo');
      await kvs.put('key2', 'bar');
    });

    it('clear all keys', async () => {
      expect(await kvs.keys()).toEqual(['key1', 'key2']);
      expect(await kvs.clear()).toEqual(true);
      expect(await kvs.keys()).toEqual([]);
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await kvs.put('key1', 'foo');
      await kvs.put('key2', 'bar');
    });

    it('checks existance for key', async () => {
      expect(await kvs.exists('key1')).toBe(true);
      expect(await kvs.exists('does_not_exist')).toBe(false);
    });
  });
});
