import {GraphQlRequest} from '../GraphQlRequest';
import {Application} from '../../app/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';


export class UpdateApplicationRequest
    extends GraphQlRequest<Application> {

    private key: ApplicationKey;

    private displayName: string;

    setKey(value: ApplicationKey): UpdateApplicationRequest {
        this.key = value;
        return this;
    }

    setDisplayName(value: string): UpdateApplicationRequest {
        this.displayName = value;
        return this;
    }

    getVariables(): Object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['displayName'] = this.displayName;
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation (key: String!, displayName: String) {
            updateApplication(key: $key, displayName: $displayName) {
               key,
               displayName
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<Application> {
        return this.mutate().then(json => Application.fromJson(json.updateApplication));
    }
}
