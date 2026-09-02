import { MemoryCacheService } from './memory-cache.service';

describe('MemoryCacheService', () => {
  let cache: MemoryCacheService;

  beforeEach(() => {
    cache = new MemoryCacheService({ ttlMs: 1000, maxSize: 3 });
  });

  it('should store and retrieve typed values', () => {
    cache.set('key1', { name: 'Pad Thai' });
    const result = cache.get<{ name: string }>('key1');

    expect(result).toEqual({ name: 'Pad Thai' });
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('unknown')).toBeNull();
  });

  it('should expire keys after TTL', async () => {
    cache.set('short-lived', 'hello', 50); // 50ms TTL

    expect(cache.get('short-lived')).toBe('hello');

    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(cache.get('short-lived')).toBeNull();
  });

  it('should evict least recently used (LRU) item when exceeding maxSize', () => {
    cache.set('item1', 'A');
    cache.set('item2', 'B');
    cache.set('item3', 'C');

    // Access item1 to make it recently used (item2 becomes oldest)
    cache.get('item1');

    // Insert 4th item (exceeds maxSize = 3) -> should evict item2
    cache.set('item4', 'D');

    expect(cache.get('item2')).toBeNull(); // evicted
    expect(cache.get('item1')).toBe('A');  // retained
    expect(cache.get('item3')).toBe('C');  // retained
    expect(cache.get('item4')).toBe('D');  // retained
    expect(cache.size).toBe(3);
  });

  it('should delete keys by prefix', () => {
    cache.set('menu:vendor1:1', 'food1');
    cache.set('menu:vendor1:2', 'food2');
    cache.set('menu:vendor2:1', 'food3');

    const deleted = cache.deleteByPrefix('menu:vendor1');

    expect(deleted).toBe(2);
    expect(cache.get('menu:vendor1:1')).toBeNull();
    expect(cache.get('menu:vendor1:2')).toBeNull();
    expect(cache.get('menu:vendor2:1')).toBe('food3');
  });

  it('should clear all keys', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
  });
});
