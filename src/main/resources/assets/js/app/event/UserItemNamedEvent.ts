import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {ModelWizardPanel} from '../wizard/ModelWizardPanel';
import {UserItem} from 'lib-admin-ui/security/UserItem';

export class UserItemNamedEvent
    extends Event {

    private readonly wizard: ModelWizardPanel<UserItem>;

    private readonly userItem: UserItem;

    constructor(wizard: ModelWizardPanel<UserItem>, userItem: UserItem) {
        super();
        this.wizard = wizard;
        this.userItem = userItem;
    }

    public getWizard(): ModelWizardPanel<UserItem> {
        return this.wizard;
    }

    public getUserItem(): UserItem {
        return this.userItem;
    }

    static on(handler: (event: UserItemNamedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemNamedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }

}

