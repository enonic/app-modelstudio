import {FindPrincipalsRequest as BaseFindPrincipalsRequest} from 'lib-admin-ui/security/FindPrincipalsRequest';
import {UrlHelper} from '../../util/UrlHelper';

export class FindPrincipalsRequest
    extends BaseFindPrincipalsRequest {

    protected getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }
}