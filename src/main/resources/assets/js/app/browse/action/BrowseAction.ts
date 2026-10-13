import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export abstract class BrowseAction
    extends Action {

    protected selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>;

    protected constructor(selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>, label: string, shortcut: string) {
        super(label, shortcut);

        this.selectionWrapper = selectionWrapper;
        this.onExecuted(this.handleExecuted.bind(this));
    }

    protected abstract handleExecuted(): void;
}
