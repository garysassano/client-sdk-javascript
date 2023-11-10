import {
  IVectorIndexClient,
  VectorDeleteItemBatch,
  VectorSearch,
  VectorUpsertItemBatch,
  ALL_VECTOR_METADATA,
  VectorSimilarityMetric,
} from '@gomomento/sdk-core';
import {
  expectWithMessage,
  ItBehavesLikeItValidatesIndexName,
  ItBehavesLikeItValidatesTopK,
  testIndexName,
  ValidateVectorProps,
  WithIndex,
} from './common-int-test-utils';
import {sleep} from '@gomomento/sdk-core/dist/src/internal/utils';
import {describe, it, expect} from 'vitest';

export function runVectorDataPlaneTest(vectorClient: IVectorIndexClient) {
  describe('upsertItem validation', () => {
    ItBehavesLikeItValidatesIndexName((props: ValidateVectorProps) => {
      return vectorClient.upsertItemBatch(props.indexName, []);
    });
  });

  describe('search validation', () => {
    ItBehavesLikeItValidatesIndexName((props: ValidateVectorProps) => {
      return vectorClient.search(props.indexName, []);
    });

    ItBehavesLikeItValidatesTopK((props: ValidateVectorProps) => {
      return vectorClient.search(props.indexName, [], {topK: props.topK});
    });
  });

  describe('delete validation', () => {
    ItBehavesLikeItValidatesIndexName((props: ValidateVectorProps) => {
      return vectorClient.deleteItemBatch(props.indexName, []);
    });
  });

  describe('upsertItem and search', () => {
    it('should support upsertItem and search using inner product', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item',
              vector: [1.0, 2.0],
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {topK: 1}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item',
              score: 5.0,
              metadata: {},
            },
          ]);
        }
      );
    });

    it('should support upsertItem and search using cosine similarity', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.COSINE_SIMILARITY,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [1.0, 1.0],
            },
            {
              id: 'test_item_2',
              vector: [-1.0, 1.0],
            },
            {
              id: 'test_item_3',
              vector: [-1.0, -1.0],
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [2.0, 2.0],
            {topK: 3}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item_1',
              score: 1.0,
              metadata: {},
            },
            {
              id: 'test_item_2',
              score: 0.0,
              metadata: {},
            },
            {
              id: 'test_item_3',
              score: -1.0,
              metadata: {},
            },
          ]);
        }
      );
    });

    it('should support upsertItem and search using euclidean similarity', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.EUCLIDEAN_SIMILARITY,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [1.0, 1.0],
            },
            {
              id: 'test_item_2',
              vector: [-1.0, 1.0],
            },
            {
              id: 'test_item_3',
              vector: [-1.0, -1.0],
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 1.0],
            {topK: 3}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item_1',
              score: 0.0,
              metadata: {},
            },
            {
              id: 'test_item_2',
              score: 4.0,
              metadata: {},
            },
            {
              id: 'test_item_3',
              score: 8.0,
              metadata: {},
            },
          ]);
        }
      );
    });

    it('should support upserting multiple items and searching', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {id: 'test_item_1', vector: [1.0, 2.0]},
            {id: 'test_item_2', vector: [3.0, 4.0]},
            {id: 'test_item_3', vector: [5.0, 6.0]},
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);
          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {topK: 3}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_3', score: 17.0, metadata: {}},
            {id: 'test_item_2', score: 11.0, metadata: {}},
            {id: 'test_item_1', score: 5.0, metadata: {}},
          ]);
        }
      );
    });

    it('should support upserting multiple items and searching with top k', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {id: 'test_item_1', vector: [1.0, 2.0]},
            {id: 'test_item_2', vector: [3.0, 4.0]},
            {id: 'test_item_3', vector: [5.0, 6.0]},
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);
          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {topK: 2}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_3', score: 17.0, metadata: {}},
            {id: 'test_item_2', score: 11.0, metadata: {}},
          ]);
        }
      );
    });

    it('should support upsert and search with metadata', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [1.0, 2.0],
              metadata: {key1: 'value1'},
            },
            {
              id: 'test_item_2',
              vector: [3.0, 4.0],
              metadata: {key2: 'value2'},
            },
            {
              id: 'test_item_3',
              vector: [5.0, 6.0],
              metadata: {key1: 'value3', key3: 'value3'},
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          let searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {
              topK: 3,
            }
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          let successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_3', score: 17.0, metadata: {}},
            {id: 'test_item_2', score: 11.0, metadata: {}},
            {id: 'test_item_1', score: 5.0, metadata: {}},
          ]);

          searchResponse = await vectorClient.search(indexName, [1.0, 2.0], {
            topK: 3,
            metadataFields: ['key1'],
          });
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_3', score: 17.0, metadata: {key1: 'value3'}},
            {id: 'test_item_2', score: 11.0, metadata: {}},
            {id: 'test_item_1', score: 5.0, metadata: {key1: 'value1'}},
          ]);

          searchResponse = await vectorClient.search(indexName, [1.0, 2.0], {
            topK: 3,
            metadataFields: ['key1', 'key2', 'key3', 'key4'],
          });
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item_3',
              score: 17.0,
              metadata: {key1: 'value3', key3: 'value3'},
            },
            {id: 'test_item_2', score: 11.0, metadata: {key2: 'value2'}},
            {id: 'test_item_1', score: 5.0, metadata: {key1: 'value1'}},
          ]);

          searchResponse = await vectorClient.search(indexName, [1.0, 2.0], {
            topK: 3,
            metadataFields: ALL_VECTOR_METADATA,
          });
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item_3',
              score: 17.0,
              metadata: {key1: 'value3', key3: 'value3'},
            },
            {id: 'test_item_2', score: 11.0, metadata: {key2: 'value2'}},
            {id: 'test_item_1', score: 5.0, metadata: {key1: 'value1'}},
          ]);
        }
      );
    });

    it('should support upsert and search with diverse metadata', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const metadata = {
            string_key: 'string_value',
            integer_key: 123,
            double_key: 3.14,
            boolean_key: true,
            list_of_strings: ['a', 'b', 'c'],
            empty_list: [],
          };
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [1.0, 2.0],
              metadata,
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {
              topK: 1,
              metadataFields: ALL_VECTOR_METADATA,
            }
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_1', score: 5.0, metadata},
          ]);
        }
      );
    });

    it.each([
      {
        similarityMetric: VectorSimilarityMetric.COSINE_SIMILARITY,
        scores: [1.0, 0.0, -1.0],
        thresholds: [0.5, -1.01, 1.0],
      },
      {
        similarityMetric: VectorSimilarityMetric.INNER_PRODUCT,
        scores: [4.0, 0.0, -4.0],
        thresholds: [0.0, -4.01, 4.0],
      },
      {
        similarityMetric: VectorSimilarityMetric.EUCLIDEAN_SIMILARITY,
        scores: [2, 10, 18],
        thresholds: [3, 20, -0.01],
      },
    ])(
      'should prune results with a search threshold',
      async ({similarityMetric, scores, thresholds}) => {
        const indexName = testIndexName();
        await WithIndex(
          vectorClient,
          indexName,
          2,
          similarityMetric,
          async () => {
            const upsertResponse = await vectorClient.upsertItemBatch(
              indexName,
              [
                {
                  id: 'test_item_1',
                  vector: [1.0, 1.0],
                },
                {
                  id: 'test_item_2',
                  vector: [-1.0, 1.0],
                },
                {
                  id: 'test_item_3',
                  vector: [-1.0, -1.0],
                },
              ]
            );
            expectWithMessage(() => {
              expect(upsertResponse).toBeInstanceOf(
                VectorUpsertItemBatch.Success
              );
            }, `expected SUCCESS but got ${upsertResponse.toString()}}`);
            await sleep(2_000);

            const queryVector = [2.0, 2.0];
            const searchHits = [
              {id: 'test_item_1', score: scores[0], metadata: {}},
              {id: 'test_item_2', score: scores[1], metadata: {}},
              {id: 'test_item_3', score: scores[2], metadata: {}},
            ];

            // Test threshold to get only the top result
            const searchResponse = await vectorClient.search(
              indexName,
              queryVector,
              {topK: 3, scoreThreshold: thresholds[0]}
            );
            expectWithMessage(() => {
              expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
            }, `expected SUCCESS but got ${searchResponse.toString()}}`);

            //
            const successResponse = searchResponse as VectorSearch.Success;
            expectWithMessage(() => {
              expect(successResponse.hits()).toEqual([searchHits[0]]);
            }, `expected ${JSON.stringify(searchHits[0])} but got ${JSON.stringify(successResponse.hits())}`);

            // Test threshold to get all results
            const searchResponse2 = await vectorClient.search(
              indexName,
              queryVector,
              {topK: 3, scoreThreshold: thresholds[1]}
            );
            expectWithMessage(() => {
              expect(searchResponse2).toBeInstanceOf(VectorSearch.Success);
            }, `expected SUCCESS but got ${searchResponse2.toString()}}`);

            const successResponse2 = searchResponse2 as VectorSearch.Success;
            expect(successResponse2.hits()).toEqual(searchHits);

            // Test threshold to get no results
            const searchResponse3 = await vectorClient.search(
              indexName,
              queryVector,
              {topK: 3, scoreThreshold: thresholds[2]}
            );
            expectWithMessage(() => {
              expect(searchResponse3).toBeInstanceOf(VectorSearch.Success);
            }, `expected SUCCESS but got ${searchResponse3.toString()}}`);

            const successResponse3 = searchResponse3 as VectorSearch.Success;
            expect(successResponse3.hits()).toEqual([]);
          }
        );
      }
    );

    it('should replacing existing items with upsert', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          let upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [1.0, 2.0],
              metadata: {key1: 'value1'},
            },
            {
              id: 'test_item_2',
              vector: [3.0, 4.0],
              metadata: {key2: 'value2'},
            },
            {
              id: 'test_item_3',
              vector: [5.0, 6.0],
              metadata: {key1: 'value3', key3: 'value3'},
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {
              id: 'test_item_1',
              vector: [2.0, 4.0],
              metadata: {key4: 'value4'},
            },
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {
              topK: 5,
              metadataFields: ALL_VECTOR_METADATA,
            }
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          const successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {
              id: 'test_item_3',
              score: 17.0,
              metadata: {key1: 'value3', key3: 'value3'},
            },
            {id: 'test_item_2', score: 11.0, metadata: {key2: 'value2'}},
            {id: 'test_item_1', score: 10.0, metadata: {key4: 'value4'}},
          ]);
        }
      );
    });

    it('should fail when upserting item with wrong number of dimensions', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {id: 'test_item', vector: [1.0, 2.0, 3.0]},
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(VectorUpsertItemBatch.Error);
          }, `expected ERROR but got ${upsertResponse.toString()}}`);

          const expectedInnerExMessage =
            "invalid parameter: vector, vector dimension has to match the index's dimension";
          const errorResponse = upsertResponse as VectorUpsertItemBatch.Error;
          expect(errorResponse.message()).toMatch(
            'Invalid argument passed to Momento client:'
          );
          expect(errorResponse.message()).toMatch(expectedInnerExMessage);
          expect(errorResponse.innerException().message).toMatch(
            expectedInnerExMessage
          );
        }
      );
    });

    it('should fail when searching with wrong number of dimensions', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {id: 'test_item_1', vector: [1.0, 2.0]},
            {id: 'test_item_2', vector: [3.0, 4.0]},
            {id: 'test_item_3', vector: [5.0, 6.0]},
          ]);
          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          const searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0, 3.0],
            {topK: 2}
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Error);
          }, `expected ERROR but got ${searchResponse.toString()}}`);
          const errorResponse = searchResponse as VectorSearch.Error;

          const expectedInnerExMessage =
            'invalid parameter: query_vector, query vector dimension must match the index dimension';
          expect(errorResponse.message()).toMatch(
            'Invalid argument passed to Momento client'
          );
          expect(errorResponse.message()).toMatch(expectedInnerExMessage);
          expect(errorResponse.innerException().message).toMatch(
            expectedInnerExMessage
          );
        }
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete ids', async () => {
      const indexName = testIndexName();
      await WithIndex(
        vectorClient,
        indexName,
        2,
        VectorSimilarityMetric.INNER_PRODUCT,
        async () => {
          const upsertResponse = await vectorClient.upsertItemBatch(indexName, [
            {id: 'test_item_1', vector: [1.0, 2.0]},
            {id: 'test_item_2', vector: [3.0, 4.0]},
            {id: 'test_item_3', vector: [5.0, 6.0]},
            {id: 'test_item_3', vector: [7.0, 8.0]},
          ]);

          expectWithMessage(() => {
            expect(upsertResponse).toBeInstanceOf(
              VectorUpsertItemBatch.Success
            );
          }, `expected SUCCESS but got ${upsertResponse.toString()}}`);

          await sleep(2_000);

          let searchResponse = await vectorClient.search(
            indexName,
            [1.0, 2.0],
            {
              topK: 10,
            }
          );
          expectWithMessage(() => {
            expect(searchResponse).toBeInstanceOf(VectorSearch.Success);
          }, `expected SUCCESS but got ${searchResponse.toString()}}`);
          let successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_3', score: 23.0, metadata: {}},
            {id: 'test_item_2', score: 11.0, metadata: {}},
            {id: 'test_item_1', score: 5.0, metadata: {}},
          ]);

          const deleteResponse = await vectorClient.deleteItemBatch(indexName, [
            'test_item_1',
            'test_item_3',
          ]);

          expectWithMessage(() => {
            expect(deleteResponse).toBeInstanceOf(
              VectorDeleteItemBatch.Success
            );
          }, `expected SUCCESS but got ${deleteResponse.toString()}}`);

          await sleep(2_000);

          searchResponse = await vectorClient.search(indexName, [1.0, 2.0], {
            topK: 10,
          });
          successResponse = searchResponse as VectorSearch.Success;
          expect(successResponse.hits()).toEqual([
            {id: 'test_item_2', score: 11.0, metadata: {}},
          ]);
        }
      );
    });
  });
}
