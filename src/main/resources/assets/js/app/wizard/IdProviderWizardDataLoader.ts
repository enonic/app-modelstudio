import * as Q from 'q';
import {SchemaWizardPanelParams} from './SchemaWizardPanelParams';
import {GetIdProviderByKeyRequest} from '../../graphql/idprovider/GetIdProviderByKeyRequest';
import {GetDefaultIdProviderRequest} from '../../graphql/idprovider/GetDefaultIdProviderRequest';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardDataLoader {}/*{

    idProvider: IdProvider;

    defaultIdProvider: IdProvider;

    loadData(params: SchemaWizardPanelParams): Q.Promise<IdProviderWizardDataLoader> {
        if (!params.persistedItem && !params.idProviderKey) {
            return this.loadDataForNew();
        } else {
            return this.loadDataForEdit(params);
        }
    }

    loadDataForEdit(params: SchemaWizardPanelParams): Q.Promise<IdProviderWizardDataLoader> {

        return this.loadDataForNew().then((loader) => {

            return this.loadIdProviderToEdit(params).then((loadedIdProviderToEdit: IdProvider) => {

                this.idProvider = loadedIdProviderToEdit;

                return this;
            });
        });
    }

    private loadDataForNew(): Q.Promise<IdProviderWizardDataLoader> {

        return this.loadDefaultIdProvider().then((defaultIdProvider: IdProvider) => {

            this.defaultIdProvider = defaultIdProvider;

            return this;
        });
    }

    private loadIdProviderToEdit(params: SchemaWizardPanelParams): Q.Promise<IdProvider> {
        if (!params.persistedItem && !!params.idProviderKey) {
            return new GetIdProviderByKeyRequest(params.idProviderKey).sendAndParse();
        } else {
            return Q(params.persistedItem);
        }
    }

    private loadDefaultIdProvider(): Q.Promise<IdProvider> {
        return new GetDefaultIdProviderRequest().sendAndParse();
    }

}
*/
