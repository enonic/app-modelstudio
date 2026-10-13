import Q from 'q';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {SelectableTreeListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableTreeListBoxKeyNavigator';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';
import {ModelBrowseToolbar} from './ModelBrowseToolbar';
import {ModelItemsTreeList} from './ModelItemsTreeList';
import {ModelTreeGridItem} from './ModelTreeGridItem';
import {ModelTreeGridActions} from './ModelTreeGridActions';
import {ModelBrowseItemPanel} from './ModelBrowseItemPanel';
import {ModelBrowseFilterPanel} from './filter/ModelBrowseFilterPanel';
import {Router} from '../Router';
import {ModelStudioServerEvent} from '../event/ModelStudioServerEvent';

export class ModelBrowsePanel
    extends BrowsePanel {

    protected treeListBox: ModelItemsTreeList;

    protected selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>;

    protected toolbar: ListBoxToolbar<ModelTreeGridItem>;

    protected treeActions: ModelTreeGridActions;

    constructor() {
        super();

        this.onShown(() => {
            Router.setHash('browse');
        });
    }

    protected initElements(): void {
        super.initElements();

        this.browseToolbar.addActions(this.getBrowseActions().getAllActions());
    }

    protected initListeners(): void {
        super.initListeners();

        this.selectionWrapper.whenRendered(() => {
            this.treeListBox.load();
        });

        ModelStudioServerEvent.on(() => {
            this.treeListBox.load();
        });
    }

    protected createToolbar(): ModelBrowseToolbar {
        return new ModelBrowseToolbar();
    }

    protected createListBoxPanel(): SelectableListBoxPanel<ModelTreeGridItem> {
        this.treeListBox = new ModelItemsTreeList({scrollParent: this});

        this.selectionWrapper = new SelectableListBoxWrapper<ModelTreeGridItem>(this.treeListBox, {
            className: 'model-list-box-wrapper',
            maxSelected: 1,
            checkboxPosition: 'left',
            highlightMode: true,
        });

        this.treeActions = new ModelTreeGridActions(this.selectionWrapper, true); // readonly mode
        this.toolbar = new ListBoxToolbar<ModelTreeGridItem>(this.selectionWrapper, {
            refreshAction: () => void this.treeListBox.load(),
        });
        this.toolbar.hideAndDisableSelectionToggler();

        return new SelectableListBoxPanel(this.selectionWrapper, this.toolbar);
    }

    protected createKeyNavigator(): SelectableTreeListBoxKeyNavigator<ModelTreeGridItem> {
        return new SelectableTreeListBoxKeyNavigator(this.selectionWrapper);
    }

    protected createBrowseItemPanel(): ModelBrowseItemPanel {
        return new ModelBrowseItemPanel(this.treeListBox, this.selectionWrapper);
    }

    protected createFilterPanel(): ModelBrowseFilterPanel {
        return null; // new ModelBrowseFilterPanel();
    }

    protected getBrowseActions(): TreeGridActions<ViewItem> {
        return this.treeActions;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('model-browse-panel readonly');
            this.browseToolbar.hide();

            return rendered;
        });
    }
}
