import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {ServerEventsListener} from '@enonic/lib-admin-ui/event/ServerEventsListener';
import {Application} from '@enonic/lib-admin-ui/app/Application';
import {ModelStudioServerEventsTranslator} from './ModelStudioServerEventsTranslator';

export class ModelStudioServerEventsListener
    extends ServerEventsListener {

    constructor(applications: Application[]) {
        super(applications);

        this.setServerEventsTranslator(new ModelStudioServerEventsTranslator());
    }
}
