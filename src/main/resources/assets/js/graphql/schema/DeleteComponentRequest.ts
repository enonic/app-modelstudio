import {BaseDeleteRequest} from './BaseDeleteRequest';
import {ModelName} from '../../app/schema/ModelName';

export class DeleteComponentRequest
    extends BaseDeleteRequest<ModelName> {

    protected getMutationName(): string {
        return 'deleteComponents';
    }

    protected convertId(value: string): ModelName {
        return ModelName.fromString(value);
    }

}
