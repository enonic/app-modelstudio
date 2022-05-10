import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {SchemaType} from './schema/SchemaType';
import {ComponentType} from './schema/ComponentType';
import {SchemaName} from './schema/SchemaName';

export interface ModelData<NAME, TYPE> {

    applicationKey: ApplicationKey;

    type: TYPE;

    name?: NAME;
}
