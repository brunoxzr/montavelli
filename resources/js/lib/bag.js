import { useSyncExternalStore } from 'react';

/** Sacola salva no navegador (sem login do cliente). */
const KEY = 'montavelli.bag';
const listeners = new Set();
let cache = null;

function read() {
    if (cache) return cache;
    try {
        cache = JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        cache = [];
    }
    return cache;
}

function write(items) {
    cache = items;
    try {
        localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
        // armazenamento indisponível: a sacola vale só nesta aba
    }
    listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === KEY) {
            cache = null;
            listeners.forEach((l) => l());
        }
    });
}

const EMPTY = [];

export function useBag() {
    const items = useSyncExternalStore(
        (cb) => (listeners.add(cb), () => listeners.delete(cb)),
        read,
        () => EMPTY,
    );
    return {
        items,
        count: items.reduce((n, i) => n + i.qty, 0),
        add,
        setQty,
        remove,
        clear: () => write([]),
    };
}

const keyOf = (i) => `${i.id}|${i.size ?? ''}|${i.color ?? ''}`;

export function add(item) {
    const items = [...read()];
    const existing = items.find((i) => keyOf(i) === keyOf(item));
    if (existing) existing.qty = Math.min(99, existing.qty + (item.qty || 1));
    else items.push({ ...item, qty: item.qty || 1 });
    write(items.map((i) => ({ ...i })));
}

export function setQty(key, qty) {
    write(read().map((i) => (keyOf(i) === key ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)));
}

export function remove(key) {
    write(read().filter((i) => keyOf(i) !== key));
}

export { keyOf };
