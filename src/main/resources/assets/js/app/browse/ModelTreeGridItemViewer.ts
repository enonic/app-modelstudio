import {ModelTreeGridItem, UserTreeGridItemType} from './ModelTreeGridItem';
import {NamesAndIconViewer} from '@enonic/lib-admin-ui/ui/NamesAndIconViewer';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ImgEl} from '@enonic/lib-admin-ui/dom/ImgEl';
import {StyleHelper} from '@enonic/lib-admin-ui/StyleHelper';

export class ModelTreeGridItemViewer
    extends NamesAndIconViewer<ModelTreeGridItem> {

    constructor() {
        super();
    }

    resolveDisplayName(object: ModelTreeGridItem): string {
        return object.getItemDisplayName();
    }

    resolveUnnamedDisplayName(object: ModelTreeGridItem): string {
        return '';
    }

    resolveSubName(object: ModelTreeGridItem): string {

        if (object.getType() != null) {
            switch (object.getType()) {
            default:
                return object.getItemDisplayName() ? object.getItemDisplayName().toLocaleLowerCase() : '';
            }
        }
        return '';
    }

    resolveIconEl(object: ModelTreeGridItem): Element {
        if (object.isApplication()) {
            if (object.getApplication().getIcon()) {
                return new ImgEl(object.getApplication().getIcon());
            }
        } else if (object.isSchema()) {
            if (object.getSchema().getIcon()) {
                return new ImgEl(object.getSchema().getIcon());
            }
        }
        return null;
    }

    resolveIconClass(object: ModelTreeGridItem): string {
        let iconClass = 'icon-large ';

        switch (object.getType()) {
            case UserTreeGridItemType.PART:
                return iconClass + StyleHelper.getCommonIconCls('part');
            case UserTreeGridItemType.LAYOUT:
                return iconClass + StyleHelper.getCommonIconCls('layout');
            case UserTreeGridItemType.PAGE:
                return iconClass + StyleHelper.getCommonIconCls('page');

            case UserTreeGridItemType.CONTENT_TYPE:
            case UserTreeGridItemType.MIXIN:
            case UserTreeGridItemType.XDATA:
                return iconClass + 'icon-file-text2';

            case UserTreeGridItemType.SITE:
            case UserTreeGridItemType.STYLES:
                return iconClass + 'icon-file-text2';

            case UserTreeGridItemType.APPLICATION:
                return 'icon-application';


            default:
                return iconClass + 'icon-folder';
        }
    }
}
