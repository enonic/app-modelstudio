import {GraphQlRequest} from '../GraphQlRequest';
import {DeleteModelResult} from './DeleteModelResult';

export abstract class BaseDeleteRequest<ID_TYPE>
    extends GraphQlRequest<DeleteModelResult<ID_TYPE>[]> {

    private ids: ID_TYPE[];

    private type: string;

    setIds(ids: ID_TYPE[]): BaseDeleteRequest<ID_TYPE> {
        this.ids = ids.slice(0);
        return this;
    }

    setType(type: string): BaseDeleteRequest<ID_TYPE> {
        this.type = type;
        return this;
    }

    getVariables(): Object {
        return {
            ids: this.ids.map((id) => id.toString()),
            type: this.type
        };
    }

    getMutation(): string {
        return `mutation ($ids: [String]!, $type: String!) {
            ${this.getMutationName()}(ids: $ids, type: $type) {
                id,
                result
            }
        }`;
    }

    protected abstract getMutationName(): string;

    sendAndParse(): Q.Promise<DeleteModelResult<ID_TYPE>[]> {
        return this.mutate().then((json) => {
            return json[this.getMutationName()].map(this.jsonToResult.bind(this));
        });
    }

    private jsonToResult(json: { id, result }): DeleteModelResult<ID_TYPE> {
        return new DeleteModelResult<ID_TYPE>(json.id, json.result);
    }

    protected abstract convertId(value: string): ID_TYPE;
}
