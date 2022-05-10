import * as Q from 'q';
import {ComponentWizardPanelParams} from './ComponentWizardPanelParams';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {Principal} from 'lib-admin-ui/security/Principal';

export class PrincipalWizardDataLoader {}/*{

    principal: Principal;

    loadData(params: ComponentWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        if (!params.persistedItem && !params.principalKey) {
            return this.loadDataForNew(params);

        } else {
            return this.loadDataForEdit(params);

        }
    }

    private loadDataForNew(params: ComponentWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        return Q(this);
    }

    private loadDataForEdit(params: ComponentWizardPanelParams): Q.Promise<PrincipalWizardDataLoader> {

        return this.loadDataForNew(params).then(() => {

            return this.loadPrincipalToEdit(params).then((loadedPrincipalToEdit: Principal) => {

                this.principal = loadedPrincipalToEdit;

                return this;
            });
        });
    }

    private loadPrincipalToEdit(params: ComponentWizardPanelParams): Q.Promise<Principal> {
        if (!params.persistedItem && !!params.principalKey) {
            return new GetPrincipalByKeyRequest(params.principalKey).setIncludeMemberships(true).sendAndParse();
        } else {
            return Q(params.persistedItem);
        }

    }

}
*/
