const DBName = 'SimpleLocalKVS';
const StoreName = 'LocalKVS';
const Version = 1;

export type UndefinedOr<T> = T extends undefined ? T | undefined : T;

export type KVS = {
  get: <T>(key: string, defaultValue?: T) => Promise<UndefinedOr<T> | Error>;
  put: <T>(key: string, value: T) => Promise<boolean | Error>;
  delete: (key: string) => Promise<boolean | Error>;
  keys: () => Promise<string[] | Error>;
  clear: () => Promise<boolean | Error>;
};

export default async function (
  indexedDB: IDBFactory,
  storeName: string = StoreName,
): Promise<KVS | Error> {
  const kvs = await getKVS(indexedDB, storeName);
  if (kvs instanceof Error) {
    return kvs;
  }

  return {
    get: <T>(key: string, defaultValue?: T) =>
      get(kvs, storeName, key, defaultValue),
    put: <T>(key: string, value: T) => put(kvs, storeName, key, value),
    delete: (key: string) => remove(kvs, storeName, key),
    clear: () => clear(kvs, storeName),
    keys: () => keys(kvs, storeName),
  };
}

async function getKVS(
  indexedDB: IDBFactory,
  storeName: string,
): Promise<IDBDatabase | Error> {
  const openRequest = indexedDB.open(DBName, Version);

  return new Promise<IDBDatabase | Error>((resolve) => {
    openRequest.onerror = () => {
      resolve(openRequest.error || new Error('Unexpected error.'));
    };

    openRequest.onupgradeneeded = () => {
      const objectStore = openRequest.result.createObjectStore(storeName);

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
  storeName: string,
  key: string,
  defaultValue?: T,
): Promise<UndefinedOr<T> | Error> {
  const req: IDBRequest<T> = db
    .transaction(storeName, 'readonly')
    .objectStore(storeName)
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
  storeName: string,
  key: string,
  value: T,
): Promise<boolean | Error> {
  const req = db
    .transaction(storeName, 'readwrite')
    .objectStore(storeName)
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

async function remove(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<boolean | Error> {
  const req = db
    .transaction(storeName, 'readwrite')
    .objectStore(storeName)
    .delete(key);

  const ret = new Promise<boolean | Error>((resolve) => {
    req.onerror = () => {
      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = () => {
      resolve(true);
    };
  }).catch((err: Error) => err);

  return ret;
}

async function keys(
  db: IDBDatabase,
  storeName: string,
): Promise<string[] | Error> {
  const req = db
    .transaction(storeName, 'readwrite')
    .objectStore(storeName)
    .openKeyCursor();

  let ret = [];
  await new Promise<boolean | Error>((resolve) => {
    req.onerror = () => {
      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor == null) {
        resolve(true);
        return;
      }

      ret.push(cursor.key);

      cursor.continue();
    };
  }).catch((err: Error) => err);

  return ret;
}

async function clear(
  db: IDBDatabase,
  storeName: string,
): Promise<boolean | Error> {
  const req = db
    .transaction(storeName, 'readwrite')
    .objectStore(storeName)
    .clear();

  const ret = new Promise<boolean | Error>((resolve) => {
    req.onerror = () => {
      resolve(req.error || new Error('Unexpected error.'));
    };

    req.onsuccess = () => {
      resolve(true);
    };
  }).catch((err: Error) => err);

  return ret;
}
