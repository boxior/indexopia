"use client";

export const IndexedDB =
    window.indexedDB ||
    (window as unknown as {mozIndexedDB: typeof window.indexedDB}).mozIndexedDB ||
    (window as unknown as {webkitIndexedDB: typeof window.indexedDB}).webkitIndexedDB ||
    (window as unknown as {msIndexedDB: typeof window.indexedDB}).msIndexedDB ||
    (window as unknown as {shimIndexedDB: typeof window.indexedDB}).shimIndexedDB;
