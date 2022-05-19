import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {ComponentType} from '../../app/schema/ComponentType';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ComponentJson} from '../../app/schema/ComponentJson';
import {Component} from '../../app/schema/Component';
import {SchemaJson} from '../../app/schema/SchemaJson';
import {Schema} from '../../app/schema/Schema';
import {SchemaType} from '../../app/schema/SchemaType';

export interface ListSchemasProperties
    extends ListGraphQlProperties {
    type: string;
    key: string;
}
type ListSchemasResult = {
    schemas: SchemaJson[];
};

export class ListSchemasRequest
    extends ListGraphQlRequest<Schema[]> {

    private type: SchemaType;
    private applicationKey: ApplicationKey;

    setType(type: SchemaType): ListSchemasRequest {
        this.type = type;
        return this;
    }

    setApplicationKey(key: ApplicationKey): ListSchemasRequest {
        this.applicationKey = key;
        return this;
    }

    getVariables(): ListSchemasProperties {
        const vars = <ListSchemasProperties>super.getVariables();

        if (this.type != null) {
            vars['type'] = SchemaType[this.type];
        }

        if (this.applicationKey) {
            vars['key'] = this.applicationKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($key: String, $type: SchemaType) {
                  schemas(key: $key, type: $type) {
                        name,
                        description,
                        displayName,
                        resource,
                        type,
                        icon
                    }
                }`;
    }

    override sendAndParse(): Q.Promise<Schema[]> {
        return this.query().then((response: ListSchemasResult) => {
            return response.schemas.map(json => Schema.fromJson(json));
        });
    }
}
