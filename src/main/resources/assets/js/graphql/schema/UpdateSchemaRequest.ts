import {Schema} from '../../app/schema/Schema';
import {GraphQlRequest} from '../GraphQlRequest';
import {SchemaJson} from '../../app/schema/SchemaJson';
import {SchemaType} from '../../app/schema/SchemaType';

export class UpdateSchemaRequest
    extends GraphQlRequest<Schema> {

    private schema: Schema;

    setSchema(value: Schema): UpdateSchemaRequest {
        this.schema = value;
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();
        vars['name'] = this.schema.getName().toString();
        vars['type'] = SchemaType[this.schema.getType()];
        vars['resource'] = this.schema.getResource();
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($name: String!, $type: String!, $resource: String!) {
            updateSchema(name: $name, type: $type, resource: $resource) {
                name,
                description,
                displayName,
                resource,
                type
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Schema> {
        return this.mutate().then(json => this.fromJson(json.updateSchema, json.error));
    }

    fromJson(schemaJson: SchemaJson, error: string): Schema {
        if (!schemaJson || error) {
            throw error;
        }

        return Schema.fromJson(schemaJson);
    }
}
