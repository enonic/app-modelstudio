import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {ComponentType} from '../../app/schema/ComponentType';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ComponentJson} from '../../app/schema/ComponentJson';
import {Component} from '../../app/schema/Component';

export interface ListComponentsProperties
    extends ListGraphQlProperties {
    type: string;
    key: string;
}
type ListComponentsResult = {
    components: ComponentJson[];
};

export class ListComponentsRequest
    extends ListGraphQlRequest<Component[]> {

    private type: ComponentType;
    private applicationKey: ApplicationKey;

    setType(type: ComponentType): ListComponentsRequest {
        this.type = type;
        return this;
    }

    setApplicationKey(key: ApplicationKey): ListComponentsRequest {
        this.applicationKey = key;
        return this;
    }

    getVariables(): ListComponentsProperties {
        const vars = <ListComponentsProperties>super.getVariables();

        if (this.type != null) {
            vars['type'] = ComponentType[this.type];
        }

        if (this.applicationKey) {
            vars['key'] = this.applicationKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($key: String, $type: ComponentType) {
                  components(key: $key, type: $type) {
                        name,
                        description,
                        displayName,
                        resource,
                        type
                    }
                }`;
    }

    override sendAndParse(): Q.Promise<Component[]> {
        return this.query().then((response: ListComponentsResult) => {
            return response.components.map(json => Component.fromJson(json));
        });
    }
}
