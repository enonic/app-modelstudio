import * as Q from 'q';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {HttpRequest} from '@enonic/lib-admin-ui/rest/HttpRequest';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {GetRequest} from '@enonic/lib-admin-ui/rest/GetRequest';

export class Request<T> implements HttpRequest<T> {

    private readonly appKey: string;
    private readonly path: Path;

    constructor(appKey: string) {
        this.appKey = appKey;
        this.path = Path.fromString(CONFIG.getString('services.visualization'));
    }

    validate(): boolean {
        return Boolean(this.appKey && this.path);
    }

    private send(): Q.Promise<T> {
        if (this.validate()) {
            const jsonRequest = new GetRequest()
            .setPath(this.path)
            .setParams({appKey: this.appKey});

            return jsonRequest.send().then((rawResponse: any) => JSON.parse(rawResponse));
        }
    }

    sendAndParse(): Q.Promise<T> {
        return this.send();
    }
}
