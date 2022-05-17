import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {DeleteUserItemRequest} from '../useritem/DeleteUserItemRequest';
import {BaseDeleteRequest} from './BaseDeleteRequest';
import {ModelName} from '../../app/schema/ModelName';

export class DeleteSchemaRequest
    extends BaseDeleteRequest<ModelName> {

    protected getMutationName(): string {
        return 'deleteSchemas';
    }

    protected convertId(value: string): ModelName {
        return ModelName.fromString(value);
    }

}
