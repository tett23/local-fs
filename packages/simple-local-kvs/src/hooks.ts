import { useEffect, useState } from 'react';
import kvs from './index';

export default function useKVS<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(undefined);
  const [updater, setUpdater] = useState<{
    fn: (newValue: T | undefined) => void;
  }>({
    fn: () => {
      setValue;
    },
  });

  useEffect(() => {
    (async () => {
      const storage = await kvs();
      if (storage instanceof Error) {
        throw storage;
      }

      const fetchedValue = await storage.get<T>(key, defaultValue);
      if (fetchedValue instanceof Error) {
        throw fetchedValue;
      }

      setValue(fetchedValue);
      setUpdater({
        fn: (newValue: T | undefined) => {
          setValue(newValue ?? defaultValue);
          storage.put(key, newValue);
        },
      });
    })();
  }, []);

  return [value, updater.fn] as const;
}
