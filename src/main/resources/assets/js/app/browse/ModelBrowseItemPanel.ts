import {ModelItemStatisticsPanel} from '../view/ModelItemStatisticsPanel';
import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {ModelItemsTreeList} from './ModelItemsTreeList';
import {ModelTreeGridItem} from './ModelTreeGridItem';

export class ModelBrowseItemPanel
    extends BrowseItemPanel {

    private modelItemStatisticsPanel: ModelItemStatisticsPanel;

    constructor(treeList: ModelItemsTreeList, selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>) {
        super();

        this.modelItemStatisticsPanel.setTreeList(treeList, selectionWrapper);
    }

    createItemStatisticsPanel(): ItemStatisticsPanel {
        this.modelItemStatisticsPanel = new ModelItemStatisticsPanel();
        return this.modelItemStatisticsPanel;
    }
}
