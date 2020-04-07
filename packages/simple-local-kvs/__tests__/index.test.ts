import localKVS from '../src/index';
import 'fake-indexeddb';

describe('put', () => {
  it('puts any value', async () => {
    const kvs = await localKVS(indexedDB);

    if (kvs instanceof Error) {
      expect(kvs).not.toBeInstanceOf(Error);
      return;
    }

    const result = await kvs.put('foo', 'bar');
    expect(result).not.toBeInstanceOf(Error);
    expect(result).toBe(true);
  });
});

describe('get', () => {
  beforeEach(async () => {
    const kvs = await localKVS(indexedDB);
    if (kvs instanceof Error) {
      expect(kvs).not.toBeInstanceOf(Error);
      return;
    }

    const result = await kvs.put('foo', 'bar');
    expect(result).not.toBeInstanceOf(Error);
    expect(result).toBe(true);
  });

  it('get any value', async () => {
    const kvs = await localKVS(indexedDB);

    if (kvs instanceof Error) {
      expect(kvs).not.toBeInstanceOf(Error);
      return;
    }

    const value = await kvs.get('foo');
    expect(value).toBe('bar');
  });
});

describe('delete', () => {
  beforeEach(async () => {
    const kvs = await localKVS(indexedDB);
    if (kvs instanceof Error) {
      expect(kvs).not.toBeInstanceOf(Error);
      return;
    }

    await kvs.put('key1', 'foo');
    await kvs.put('key2', 'bar');
  });

  it('delete any value', async () => {
    const kvs = await localKVS(indexedDB);

    if (kvs instanceof Error) {
      expect(kvs).not.toBeInstanceOf(Error);
      return;
    }

    expect(await kvs.delete('key1')).toBe(true);
    expect(await kvs.get('key1')).toBe(undefined);
    expect(await kvs.delete('does_not_exist')).toBe(true);
  });
});
