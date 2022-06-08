import {BaseModelEvent} from './BaseModelEvent';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class NewModelEvent
    extends BaseModelEvent {

    static on(handler: (event: NewModelEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: NewModelEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
