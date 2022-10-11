import {ModelTreeGridItem, UserTreeGridItemType} from './ModelTreeGridItem';
import {NamesAndIconViewer} from '@enonic/lib-admin-ui/ui/NamesAndIconViewer';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ImgEl} from '@enonic/lib-admin-ui/dom/ImgEl';

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
        const subName = object.getId() ? object.getId().split(/\:|\//g)[1] : '';

        if (subName) {
            return subName;
        }

        return object.getItemDisplayName() ? object.getItemDisplayName().toLocaleLowerCase() : '';
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

    resolveIconUrl(object: ModelTreeGridItem): string {
        return object.getIconUrl() || '';
    }

    resolveIconClass(object: ModelTreeGridItem): string {
        return object.getIconClass() || '';
    }
}
