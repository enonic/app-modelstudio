import {UserItemJson} from '@enonic/lib-admin-ui/security/UserItemJson';

export interface ApplicationJson
    extends UserItemJson {
    key: string;
    displayName: string;
    description: string;
    icon: string;
}
