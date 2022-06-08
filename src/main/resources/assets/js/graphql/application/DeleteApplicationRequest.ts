import {GraphQlRequest} from '../GraphQlRequest';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {DeleteModelResult} from '../schema/DeleteModelResult';

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
