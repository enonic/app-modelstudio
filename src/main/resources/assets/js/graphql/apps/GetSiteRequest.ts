import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {ComponentType} from '../../app/schema/ComponentType';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';
import {ComponentJson} from '../../app/schema/ComponentJson';
import {Component} from '../../app/schema/Component';
import {SchemaJson} from '../../app/schema/SchemaJson';
import {Schema} from '../../app/schema/Schema';
import {SchemaType} from '../../app/schema/SchemaType';
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
