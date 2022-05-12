import {UserItemKey} from 'lib-admin-ui/security/UserItemKey';

export class DeleteModelResult<ID_TYPE> {

    private id: ID_TYPE;

    private result: boolean;

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
