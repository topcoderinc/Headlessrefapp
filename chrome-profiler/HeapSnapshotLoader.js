const self = global;
self.HeapSnapshotModel = {};
require('chrome-devtools-frontend/front_end/heap_snapshot_model/HeapSnapshotModel');
self.HeapSnapshotWorker = {};
self.HeapSnapshotModel= HeapSnapshotModel;
self.Common = { UIString: x => x };

self.TextUtils = { TextUtils: {} };
require('chrome-devtools-frontend/front_end/text_utils/TextUtils');

const runtime = { queryParam: () => false };
self.Runtime = runtime;
self.self = {
  Runtime: runtime,
  addEventListener: () => {}
};

require('chrome-devtools-frontend/front_end/heap_snapshot_worker/AllocationProfile');
require('chrome-devtools-frontend/front_end/heap_snapshot_worker/HeapSnapshot');
require('chrome-devtools-frontend/front_end/heap_snapshot_worker/HeapSnapshotLoader');
require('chrome-devtools-frontend/front_end/heap_snapshot_worker/HeapSnapshotWorkerDispatcher');
require('chrome-devtools-frontend/front_end/heap_snapshot_worker/HeapSnapshotWorker');


const dispatcher = new HeapSnapshotWorker.HeapSnapshotWorkerDispatcher({}, () => {});

const loader = new HeapSnapshotWorker.HeapSnapshotLoader(dispatcher);

module.exports = loader;