import merge from "lodash/merge";

import {IndexedDB} from "@/utils/constants/client.constants";
import {IndexDBName} from "@/utils/types/general.types";

interface IndexDB {
    get<T>(key: IDBValidKey): Promise<T | undefined>;
    get<T>(): Promise<T | undefined>;
    save<T>(key: IDBValidKey, value: T): Promise<IDBValidKey>;
    save<T>(value: T): Promise<IDBValidKey>;
    update<T>(key: IDBValidKey, value: Partial<T>): Promise<IDBValidKey>;
    update<T>(value: Partial<T>): Promise<IDBValidKey>;
    remove(key: IDBValidKey): Promise<void>;
    remove(): Promise<void>;
    deleteDatabase(): void;
}

export const indexDBFactory = (databaseName: IndexDBName): Promise<IndexDB> => {
    return new Promise<IndexDB>((resolve, reject) => {
        if (!IndexedDB) {
            return;
        }

        const existingDBConnectionRequest = IndexedDB.open(databaseName);

        existingDBConnectionRequest.onupgradeneeded = () => {
            const database = existingDBConnectionRequest.result;
            database.createObjectStore(database.name);
        };

        existingDBConnectionRequest.onsuccess = () => {
            const database = existingDBConnectionRequest.result;

            return resolve({
                ...getIndexDBCrudFacade(database),
                deleteDatabase: () => IndexedDB?.deleteDatabase(database.name),
            });
        };

        existingDBConnectionRequest.onerror = () => {
            reject(existingDBConnectionRequest.error);
        };
    });
};

const getIndexDBCrudFacade = (database: IDBDatabase): Omit<IndexDB, "deleteDatabase"> => {
    const get = <T>(key?: IDBValidKey) => {
        const keyUsed = key ?? (database.name as IDBValidKey);

        return new Promise<T>((resolve, reject) => {
            const transaction = database.transaction(database.name, "readwrite");
            const store = transaction.objectStore(database.name);

            const getQueryRequest = store.get(keyUsed);

            getQueryRequest.onsuccess = () => resolve(getQueryRequest.result);

            getQueryRequest.onerror = () => reject(getQueryRequest.error);
        });
    };

    const save = <T>(key: IDBValidKey | T, value?: T) => {
        const keyUsed = value === undefined ? (database.name as IDBValidKey) : (key as IDBValidKey);
        const valueUsed = value === undefined ? (key as T) : value;

        return new Promise<IDBValidKey>((resolve, reject) => {
            const transaction = database.transaction(database.name, "readwrite");
            const store = transaction.objectStore(database.name);

            const setQueryRequest = store.put(valueUsed, keyUsed);

            setQueryRequest.onsuccess = () => resolve(setQueryRequest.result);

            setQueryRequest.onerror = () => reject(setQueryRequest.error);
        });
    };

    const update = <T>(key: IDBValidKey | Partial<T>, value?: Partial<T>) => {
        const keyUsed = value === undefined ? (database.name as IDBValidKey) : (key as IDBValidKey);
        const valueUsed = value === undefined ? (key as Partial<T>) : value;

        return new Promise<IDBValidKey>((resolve, reject) => {
            const transaction = database.transaction(database.name, "readwrite");
            const store = transaction.objectStore(database.name);

            const getQueryRequest = store.get(keyUsed);

            getQueryRequest.onsuccess = () => {
                const getQueryRequestResult = getQueryRequest.result as T;

                const updatedEntity = merge(getQueryRequestResult, valueUsed);

                const putQueryRequest = store.put(updatedEntity, keyUsed);

                putQueryRequest.onsuccess = () => resolve(putQueryRequest.result);

                putQueryRequest.onerror = () => reject(putQueryRequest.onerror);
            };

            getQueryRequest.onerror = () => reject(getQueryRequest.error);
        });
    };

    const remove = (key?: IDBValidKey) => {
        const keyUsed = key ?? (database.name as IDBValidKey);

        return new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(database.name, "readwrite");
            const store = transaction.objectStore(database.name);

            const deleteQueryRequest = store.delete(keyUsed);

            deleteQueryRequest.onsuccess = () => resolve();

            deleteQueryRequest.onerror = () => reject(deleteQueryRequest.error);
        });
    };

    return {
        get,
        save,
        update,
        remove,
    };
};
