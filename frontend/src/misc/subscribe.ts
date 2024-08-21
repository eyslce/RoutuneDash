const StorageKey = 'fake.me.subscribe';

function loadSubscribe() {
    try {
        const serialized = localStorage.getItem(StorageKey);
        if (!serialized) return undefined;
        return serialized;
    } catch (err) {
        return undefined;
    }
}

function saveSubscribe(subscribeUrl: string) {
    try {
        console.log('saveSubscribe', subscribeUrl);
        localStorage.setItem(StorageKey, subscribeUrl);
    } catch (err) {
        // ignore
    }
}

export { loadSubscribe, saveSubscribe }