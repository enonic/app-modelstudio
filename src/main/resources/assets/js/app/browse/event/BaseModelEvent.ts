import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class BaseModelEvent
    extends Event {

    private gridItems: ModelTreeGridItem[];

    constructor(gridItems: ModelTreeGridItem[]) {
        super();

        this.gridItems = gridItems;
    }

    getPrincipals(): ModelTreeGridItem[] {
        return this.gridItems;
    }
}
