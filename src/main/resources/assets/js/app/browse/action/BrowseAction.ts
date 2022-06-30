import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {Action} from '@enonic/lib-admin-ui/ui/Action';

export abstract class BrowseAction
    extends Action {

    protected grid: ModelItemsTreeGrid;

    protected constructor(grid: ModelItemsTreeGrid, label: string, shortcut: string) {
        super(label, shortcut);

        this.grid = grid;
        this.onExecuted(this.handleExecuted.bind(this));
    }

    protected abstract handleExecuted(): void;
}