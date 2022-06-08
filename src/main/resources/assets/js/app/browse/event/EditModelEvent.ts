import {BaseModelEvent} from './BaseModelEvent';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class EditModelEvent
    extends BaseModelEvent {

    static on(handler: (event: EditModelEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: EditModelEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
