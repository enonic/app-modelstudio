import {DeleteModelResult} from './DeleteModelResult';

export class DeleteSchemasResult<ID_TYPE> {

    private readonly schemas: DeleteModelResult<ID_TYPE>[];

    constructor(builder: DeleteSchemasResultBuilder<ID_TYPE>) {
        this.schemas = builder.schemas;
    }

    getSchemas(): DeleteModelResult<ID_TYPE>[] {
        return this.schemas;
    }

    static create<ID_TYPE>(): DeleteSchemasResultBuilder<ID_TYPE> {
        return new DeleteSchemasResultBuilder<ID_TYPE>();
    }
}

export class DeleteSchemasResultBuilder<ID_TYPE> {

    schemas: DeleteModelResult<ID_TYPE>[] = [];

    addSchema(value: DeleteModelResult<ID_TYPE>): DeleteSchemasResultBuilder<ID_TYPE> {
        if (value) {
            this.schemas.push(value);
        }
        return this;
    }

    build(): DeleteSchemasResult<ID_TYPE> {
        return new DeleteSchemasResult(this);
    }
}
