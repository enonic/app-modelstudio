import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class NewApplicationEvent
    extends Event {

    static on(handler: (event: NewApplicationEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: NewApplicationEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
