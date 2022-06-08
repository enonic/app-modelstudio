import {Router} from '../Router';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {ModelItemsTreeGrid} from './ModelItemsTreeGrid';
import {ModelBrowseItemPanel} from './ModelBrowseItemPanel';
import {ModelBrowseFilterPanel} from './filter/ModelBrowseFilterPanel';
import {ModelBrowseToolbar} from './ModelBrowseToolbar';

export class ModelBrowsePanel
    extends BrowsePanel {

    protected treeGrid: ModelItemsTreeGrid;

    constructor() {
        super();

        this.onShown(() => {
            Router.setHash('browse');
        });
    }

    protected createToolbar(): ModelBrowseToolbar {
        let browseActions = this.treeGrid.getTreeGridActions();

        return new ModelBrowseToolbar(browseActions);
    }

    protected createTreeGrid(): ModelItemsTreeGrid {
        return new ModelItemsTreeGrid();
    }

    protected createBrowseItemPanel(): ModelBrowseItemPanel {
        return new ModelBrowseItemPanel();
    }

    protected createFilterPanel(): ModelBrowseFilterPanel {
        return new ModelBrowseFilterPanel();
    }

    protected enableSelectionMode(): void {
        this.filterPanel.setSelectedItems(this.treeGrid.getSelectedItems());
    }

    protected disableSelectionMode(): void {
        this.filterPanel.resetConstraints();
        this.hideFilterPanel();
        super.disableSelectionMode();
    }
}
