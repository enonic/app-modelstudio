import {EventJson} from '@enonic/lib-admin-ui/event/EventJson';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {NodeEventJson} from '@enonic/lib-admin-ui/event/NodeServerEvent';
import {ServerEventsTranslator} from '@enonic/lib-admin-ui/event/ServerEventsTranslator';
import {ModelStudioServerEvent} from './ModelStudioServerEvent';

export class ModelStudioServerEventsTranslator
    extends ServerEventsTranslator {

    translateServerEvent(eventJson: EventJson): Event {
        const eventType: string = eventJson.type;

        if (eventType.indexOf('node.') === 0) {
            if (ModelStudioServerEvent.is(<NodeEventJson>eventJson)) {
                return ModelStudioServerEvent.fromJson(<NodeEventJson>eventJson);
            }
        }

        return super.translateServerEvent(eventJson);
    }

}
