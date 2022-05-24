import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {Site} from '../../app/schema/Site';
import {SiteJson} from '../../app/schema/SiteJson';

export interface GetSiteProperties
    extends ListGraphQlProperties {
    key: string;
}
type GetSiteResult = {
    site: SiteJson;
};

export class GetSiteRequest
    extends ListGraphQlRequest<Site> {

    private applicationKey: ApplicationKey;

    setApplicationKey(key: ApplicationKey): GetSiteRequest {
        this.applicationKey = key;
        return this;
    }

    getVariables(): GetSiteProperties {
        const vars = <GetSiteProperties>super.getVariables();

        if (this.applicationKey) {
            vars['key'] = this.applicationKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($key: String) {
                  site(key: $key) {
                        key,
                        resource
                    }
                }`;
    }

    override sendAndParse(): Q.Promise<Site> {
        return this.query().then((response: GetSiteResult) => {
            return response.site ? Site.fromJson(response.site) : null;
        });
    }
}
