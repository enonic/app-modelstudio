import * as Q from 'q';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ModelItemStatisticsHeader} from './ModelItemStatisticsHeader';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';

export class ModelItemStatisticsPanel
    extends ItemStatisticsPanel {

    private header: ModelItemStatisticsHeader;

    private descriptorTextArea: TextArea;

    constructor() {
        super('model-item-statistics-panel');

        this.initElements();
    }

    protected initElements(): void {
        this.header = new ModelItemStatisticsHeader();
        this.descriptorTextArea = new TextArea('descriptor-area');
        this.descriptorTextArea.hide();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.descriptorTextArea.getEl().setAttribute('readonly', '');
            this.appendChild(this.header);
            this.appendChild(this.descriptorTextArea);

            return rendered;
        });
    }

    setItem(item: ModelTreeGridItem) {
        const currentItem = this.getItem();

        if (!currentItem || !currentItem.equals(item)) {
            this.refreshPanel(item);

            super.setItem(item);
            this.header.setItem(item);
        }
    }

    private refreshPanel(item: ModelTreeGridItem) {
        this.appendMetadata(item);
    }

    private appendMetadata(item: ModelTreeGridItem): void {
        const descriptor: string = this.getItemDescriptor(item);

        if (descriptor) {
            this.setResource(descriptor);
            this.descriptorTextArea.show();
        } else {
            this.descriptorTextArea.hide();
        }
    }

    private getItemDescriptor(item: ModelTreeGridItem): string {
        if (item.isComponent()) {
            return item.getComponent()?.getResource();
        }

        if (item.isSchema()) {
            return item.getSchema()?.getResource();
        }

        if (item.isSite()) {
            return item.getSite()?.getResource();
        }

        if (item.isStyles()) {
            return item.getStyles()?.getResource();
        }

        if (item.isApplication()) {
            return item.getApplication()?.getResource();
        }

        return '';
    }

    private setResource(descriptor: string): void {
        this.descriptorTextArea.setValue(descriptor);
    }
}
