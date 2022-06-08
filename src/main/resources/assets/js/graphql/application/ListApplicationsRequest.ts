import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {ApplicationJson} from '../../app/application/ApplicationJson';
import {Application} from '../../app/application/Application';

export type ListApplicationsResult = {
    applications: [ApplicationJson]
};

export class ListApplicationsRequest
    extends ListGraphQlRequest<Application[]> {

    getVariables(): ListGraphQlProperties {
        return super.getVariables();
    }

    getQuery(): string {
        return `query {
                  applications {
                            key
                            displayName
                            modifiedTime
                            icon
                    }
                }`;
    }

    sendAndParse(): Q.Promise<Application[]> {
        return this.query().then((response: ListApplicationsResult) => {
            return response.applications.map(json => Application.fromJson(json));
        });
    }
}
