import {FormJson} from 'lib-admin-ui/form/json/FormJson';

export interface ComponentJson {

    name: string;

    displayName: string;

    description: string;

    resource: string;

    type: string;

    // config: FormJson;

    icon: string;

    // regions: RegionsDescriptorJson[];
}
