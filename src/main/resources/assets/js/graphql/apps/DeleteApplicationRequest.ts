import {GraphQlRequest} from '../GraphQlRequest';
import {Component} from '../../app/schema/Component';
import {ComponentType} from '../../app/schema/ComponentType';
import {ComponentJson} from '../../app/schema/ComponentJson';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {DeleteModelResult} from './DeleteModelResult';


export class DeleteApplicationRequest
    extends GraphQlRequest<DeleteModelResult<ApplicationKey>> {

    private key: ApplicationKey;

    setKey(value: ApplicationKey): DeleteApplicationRequest {
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
        return `mutation ($key: String!) {
            deleteApplication(key: $key) {
                id,
                result
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<DeleteModelResult<ApplicationKey>> {
        return this.mutate().then(json => new DeleteModelResult<ApplicationKey>(json.deleteApplication.id, json.deleteApplication.result));
    }

}
