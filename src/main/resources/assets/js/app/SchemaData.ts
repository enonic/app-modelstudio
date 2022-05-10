import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {SchemaType} from './schema/SchemaType';
import {ComponentType} from './schema/ComponentType';
import {SchemaName} from './schema/SchemaName';
import {ModelData} from './ModelData';

export interface SchemaData extends ModelData<SchemaName, SchemaType>{
}
