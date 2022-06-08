import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {Styles} from '../../app/schema/Styles';
import {StylesJson} from '../../app/schema/StylesJson';

export interface GetStylesProperties
    extends ListGraphQlProperties {
    key: string;
}
type GetStylesResult = {
    styles: StylesJson;
};

export class GetStylesRequest
    extends ListGraphQlRequest<Styles> {

    private applicationKey: ApplicationKey;

    setApplicationKey(key: ApplicationKey): GetStylesRequest {
        this.applicationKey = key;
        return this;
    }

    getVariables(): GetStylesProperties {
        const vars = <GetStylesProperties>super.getVariables();

        if (this.applicationKey) {
            vars['key'] = this.applicationKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($key: String) {
                  styles(key: $key) {
                        key,
                        resource
                    }
                }`;
    }

    override sendAndParse(): Q.Promise<Styles> {
        return this.query().then((response: GetStylesResult) => {
            return response.styles ? Styles.fromJson(response.styles) : null;
        });
    }
}
