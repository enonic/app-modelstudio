import {UserItemJson} from 'lib-admin-ui/security/UserItemJson';

export interface ApplicationJson
    extends UserItemJson {
    key: string;
    displayName: string;
    modifiedTime: Date;
    description: string;
    icon: string;
}
