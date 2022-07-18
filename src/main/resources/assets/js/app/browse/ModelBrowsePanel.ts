import {Router} from '../Router';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {ModelItemsTreeGrid} from './ModelItemsTreeGrid';
import {ModelBrowseItemPanel} from './ModelBrowseItemPanel';
import {ModelBrowseFilterPanel} from './filter/ModelBrowseFilterPanel';
import {ModelBrowseToolbar} from './ModelBrowseToolbar';
import {ModelStudioServerEvent} from '../event/ModelStudioServerEvent';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import * as Q from 'q';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';

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
        return null; // new ModelBrowseFilterPanel();
    }

    protected enableSelectionMode(): void {
        this.treeGrid.filter(this.treeGrid.getSelectedDataList());
    }

    protected getBrowseActions(): TreeGridActions<ViewItem> {
        return null; // readonly mode
    }

    protected initListeners(): void {
        super.initListeners();

        ModelStudioServerEvent.on((event: ModelStudioServerEvent) => {
            this.treeGrid.reload().catch(DefaultErrorHandler.handle);
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('model-browse-panel readonly');
            this.browseToolbar.hide();

            return rendered;
        });
    }
}
