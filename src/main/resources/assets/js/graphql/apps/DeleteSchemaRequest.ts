import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {DeleteUserItemRequest} from '../useritem/DeleteUserItemRequest';
import {BaseDeleteRequest} from './BaseDeleteRequest';
import {SchemaName} from '../../app/schema/SchemaName';

export class DeleteSchemaRequest
    extends BaseDeleteRequest<SchemaName> {

    protected getMutationName(): string {
        return 'deleteSchemas';
    }

    protected convertId(value: string): SchemaName {
        return SchemaName.fromString(value);
    }

}
