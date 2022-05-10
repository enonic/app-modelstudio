import {DeleteSchemaResult} from './DeleteSchemaResult';

export class DeleteSchemasResult<ID_TYPE> {

    private readonly schemas: DeleteSchemaResult<ID_TYPE>[];

    constructor(builder: DeleteSchemasResultBuilder<ID_TYPE>) {
        this.schemas = builder.schemas;
    }

    getSchemas(): DeleteSchemaResult<ID_TYPE>[] {
        return this.schemas;
    }

    static create<ID_TYPE>(): DeleteSchemasResultBuilder<ID_TYPE> {
        return new DeleteSchemasResultBuilder<ID_TYPE>();
    }
}

export class DeleteSchemasResultBuilder<ID_TYPE> {

    schemas: DeleteSchemaResult<ID_TYPE>[] = [];

    addSchema(value: DeleteSchemaResult<ID_TYPE>): DeleteSchemasResultBuilder<ID_TYPE> {
        if (value) {
            this.schemas.push(value);
        }
        return this;
    }

    build(): DeleteSchemasResult<ID_TYPE> {
        return new DeleteSchemasResult(this);
    }
}
