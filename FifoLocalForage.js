class Queue {
    constructor(name) {
        this.name = name;
        this.headFieldPointer = null;
        this.tailFieldPointer = null;
        this.start();
    }
    async start() {
        this.headFieldPointer = await this.getElementWithKey('Head');
        this.tailFieldPointer = await this.getElementWithKey('Tail');
    }

    async tail() {
        const result = await localforage.getItem(this.name + 'Tail').then((value) => {
            return value;
        });
        return result;
    }
    async head() {
        const item = await localforage.getItem(this.name + 'Head');

        return item;
    }

    async getElementWithKey(key) {
        const result = await localforage.getItem(this.name + key);

        return result || null;
    }

    async setElementWithKey(key, value) {
        await localforage.setItem(this.name + key, value);
    }

    async isThereQueue(name) {
        const keys = await localforage.keys();
        const isThere = keys.find((element) => element.startsWith(name)) || false;
        return isThere;
    }

    async lastIndexCounter(direction) {
        const result = await localforage.getItem(this.name + 'LastIndex').then((value) => {
            localforage.setItem(this.name + 'LastIndex', value + direction);
            return value + direction;
        });
        return result;
    }

    async setPrevForActualHead(value) {
        await localforage.setItem(this.headFieldPointer + '-Prev', value);
    }

    async push_head(value) {
        const index = await this.lastIndexCounter(1);
        const nameNewElement = 'Element-' + index;

        await this.getElementWithKey('Head').then((head) => {
            this.setElementWithKey(nameNewElement + '-Value', value);

            if (!this.tailFieldPointer) {
                this.setElementWithKey('Tail', this.name + 'Element-' + index);
            }
            this.setElementWithKey(nameNewElement + '-Next', this.headFieldPointer === null ? '' : this.headFieldPointer);
            this.setElementWithKey(nameNewElement + '-Prev', '');

            this.setElementWithKey('Head', this.name + 'Element-' + index);
            if (this.tailFieldPointer) this.setPrevForActualHead(this.name + nameNewElement);
        });

        this.headFieldPointer = await this.getElementWithKey('Head');
        this.tailFieldPointer = await this.getElementWithKey('Tail');
    }

    async pop_tail() {
        try {
            const oldTail = await this.getElementWithKey('Tail');
            const oldTailValue = await localforage.getItem(oldTail + '-Value');
            if (!oldTail) {
                this.headFieldPointer = await this.getElementWithKey('Head');
                this.tailFieldPointer = await this.getElementWithKey('Tail');
                return null;
            }
            const newTail = await localforage.getItem(oldTail + '-Prev');

            if (newTail) await localforage.setItem(newTail + '-Next', '');
            if (this.headFieldPointer === this.tailFieldPointer) {
                await localforage.removeItem(this.name + 'Tail');
                await localforage.removeItem(this.name + 'Head');
            }

            await localforage.removeItem(oldTail + '-Prev');
            await localforage.removeItem(oldTail + '-Next');
            await localforage.removeItem(oldTail + '-Value');

            if (newTail) await this.setElementWithKey('Tail', newTail);
            this.headFieldPointer = await this.getElementWithKey('Head');
            this.tailFieldPointer = await this.getElementWithKey('Tail');
            await this.lastIndexCounter(-1);

            return oldTailValue;
        } catch (err) {
            console.log(err);
        }
    }

    async getLastIndex() {
        const item = await localforage.getItem(this.name + 'LastIndex');

        return item;
    }
}
