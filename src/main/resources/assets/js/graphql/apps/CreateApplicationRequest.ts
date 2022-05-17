import {GraphQlRequest} from '../GraphQlRequest';
import {Component} from '../../app/schema/Component';
import {ComponentJson} from '../../app/schema/ComponentJson';
import {ComponentType} from '../../app/schema/ComponentType';
import {Application} from '../../app/application/Application';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';


export class CreateApplicationRequest
    extends GraphQlRequest<Application> {

    private key: ApplicationKey;

    setKey(value: ApplicationKey): CreateApplicationRequest {
        this.key = value;
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation($key: String!) {
                    createApplication(key: $key) {
                        key
                    }
                }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Application> {
        return this.mutate().then(json => Application.fromJson(json.createApplication));
    }
}
