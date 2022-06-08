export class DeleteModelResult<ID_TYPE> {

    private readonly id: ID_TYPE;

    private readonly result: boolean;

    constructor(id: ID_TYPE, result: boolean) {
        this.id = id;
        this.result = result;
    }

    getId(): ID_TYPE {
        return this.id;
    }

    getResult(): boolean {
        return this.result;
    }
}
