const DBNaame = 'SimpleLocalKVS';
const StoreName = 'LocalKVS';
const Version = 1;

export type UndefinedOr<T> = T extends undefined ? T | undefined : T;

export type KVS = {
  get: <T>(key: string, defaultValue?: T) => Promise<UndefinedOr<T> | Error>;
  put: <T>(key: string, value: T) => Promise<boolean | Error>;
  delete: (key: string) => Promise<boolean | Error>;
};

export default async function(indexedDB: IDBFactory): Promise<KVS | Error> {
  const kvs = await getKVS(indexedDB);
  if (kvs instanceof Error) {
    return kvs;
  }

  return {
    get: <T>(key: string, defaultValue?: T) => get(kvs, key, defaultValue),
    put: <T>(key: string, value: T) => put(kvs, key, value),
    delete: (key: string) => remove(kvs, key),
  };
}

async function getKVS(indexedDB: IDBFactory): Promise<IDBDatabase | Error> {
  const openRequest = indexedDB.open(DBNaame, Version);

  return new Promise<IDBDatabase | Error>((resolve) => {
    openRequest.onerror = () => {
      resolve(openRequest.error || new Error('Unexpected error.'));
    };

    openRequest.onupgradeneeded = () => {
      const objectStore = openRequest.result.createObjectStore(StoreName);

      objectStore.transaction.oncomplete = () => {
        resolve(openRequest.result);
      };
    };

    openRequest.onsuccess = () => {
      resolve(openRequest.result);
    };
  }).catch((err: Error) => err);
}

async function get<T>(
  db: IDBDatabase,
  key: string,
  defaultValue?: T,
): Promise<UndefinedOr<T> | Error> {
  const req: IDBRequest<T> = db
    .transaction(StoreName, 'readonly')
    .objectStore(StoreName)
    .get(key);

  return new Promise<UndefinedOr<T> | Error>((resolve) => {
    req.onerror = () => {
      if (defaultValue != null) {
        resolve(defaultValue as UndefinedOr<T>);
        return;
      }

      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = () => {
      resolve((req.result || defaultValue) as UndefinedOr<T>);
    };
  }).catch((err: Error) => err);
}

async function put<T>(
  db: IDBDatabase,
  key: string,
  value: T,
): Promise<boolean | Error> {
  const req = db
    .transaction(StoreName, 'readwrite')
    .objectStore(StoreName)
    .put(value, key);

  return new Promise<boolean | Error>((resolve) => {
    req.onerror = () => {
      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = () => {
      resolve(true);
    };
  }).catch((err: Error) => err);
}

async function remove(db: IDBDatabase, key: string): Promise<boolean | Error> {
  const req = db
    .transaction(StoreName, 'readwrite')
    .objectStore(StoreName)
    .delete(key);

  const ret = new Promise<boolean | Error>((resolve) => {
    req.onerror = () => {
      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = (a) => {
      resolve(true);
    };
  }).catch((err: Error) => err);

  return ret;
}
