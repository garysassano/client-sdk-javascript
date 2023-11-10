import {v4} from 'uuid';
import {
  ValidateCacheProps,
  ItBehavesLikeItValidatesCacheName,
  expectWithMessage,
} from './common-int-test-utils';
import {ICacheClient} from '@gomomento/sdk-core/dist/src/internal/clients/cache';
import {CacheItemGetType} from '@gomomento/sdk-core';
import {ItemType} from '@gomomento/sdk-core/dist/src/utils';
import {describe, it, expect} from 'vitest';
export function runItemGetTypeTest(
  cacheClient: ICacheClient,
  integrationTestCacheName: string
) {
  describe('item type', () => {
    ItBehavesLikeItValidatesCacheName((props: ValidateCacheProps) => {
      return cacheClient.itemGetType(props.cacheName, v4());
    });

    it('should get item type scalar', async () => {
      const cacheKey = v4();
      const cacheValue = v4();
      await cacheClient.set(integrationTestCacheName, cacheKey, cacheValue);

      // string cache key
      let itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        cacheKey
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      let hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SCALAR);

      // byte array cache key
      itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        new TextEncoder().encode(cacheKey)
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SCALAR);
    });

    it('should get item type dictionary', async () => {
      const cacheKey = v4();
      await cacheClient.dictionarySetField(
        integrationTestCacheName,
        cacheKey,
        v4(),
        v4()
      );

      // string cache key
      let itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        cacheKey
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      let hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.DICTIONARY);

      // byte array cache key
      itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        new TextEncoder().encode(cacheKey)
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.DICTIONARY);
    });

    it('should get item type list', async () => {
      const cacheKey = v4();
      await cacheClient.listPushFront(integrationTestCacheName, cacheKey, v4());

      // string cache key
      let itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        cacheKey
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      let hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.LIST);

      // byte array cache key
      itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        new TextEncoder().encode(cacheKey)
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.LIST);
    });

    it('should get item type set', async () => {
      const cacheKey = v4();
      await cacheClient.setAddElement(integrationTestCacheName, cacheKey, v4());

      // string cache key
      let itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        cacheKey
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      let hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SET);

      // byte array cache key
      itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        new TextEncoder().encode(cacheKey)
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SET);
    });

    it('should get item type sorted set', async () => {
      const cacheKey = v4();
      await cacheClient.sortedSetPutElement(
        integrationTestCacheName,
        cacheKey,
        'a',
        42
      );

      // string cache key
      let itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        cacheKey
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      let hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SORTED_SET);

      // byte array cache key
      itemGetTypeResponse = await cacheClient.itemGetType(
        integrationTestCacheName,
        new TextEncoder().encode(cacheKey)
      );
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.SORTED_SET);
    });

    it('should support happy path for itemGetType via curried cache via ICache interface', async () => {
      const cacheKey = v4();

      const cache = cacheClient.cache(integrationTestCacheName);
      await cache.dictionarySetField(cacheKey, v4(), v4());

      // string cache key
      const itemGetTypeResponse = await cache.itemGetType(cacheKey);
      expectWithMessage(() => {
        expect(itemGetTypeResponse).toBeInstanceOf(CacheItemGetType.Hit);
      }, `expected HIT but got ${itemGetTypeResponse.toString()}`);
      const hitResult = itemGetTypeResponse as CacheItemGetType.Hit;
      expect(hitResult.itemType()).toEqual(ItemType.DICTIONARY);
    });
  });
}
