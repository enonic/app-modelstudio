import {GraphQlRequest} from '../GraphQlRequest';
import {Component} from '../../app/schema/Component';
import {ComponentType} from '../../app/schema/ComponentType';
import {ComponentJson} from '../../app/schema/ComponentJson';

export class UpdateComponentRequest
    extends GraphQlRequest<Component> {

    private component: Component;

    setComponent(value: Component): UpdateComponentRequest {
        this.component = value;
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();
        vars['name'] = this.component.getName().toString();
        vars['type'] = ComponentType[this.component.getType()];
        vars['resource'] = this.component.getResource();
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($name: String!, $type: String!, $resource: String!) {
            updateComponent(name: $name, type: $type, resource: $resource) {
                name,
                description,
                displayName,
                resource,
                type
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Component> {
        return this.mutate().then(json => this.fromJson(json.updateComponent, json.error));
    }

    fromJson(componentJson: ComponentJson, error: string): Component {
        if (!componentJson || error) {
            throw error;
        }

        return Component.fromJson(componentJson);
    }
}
