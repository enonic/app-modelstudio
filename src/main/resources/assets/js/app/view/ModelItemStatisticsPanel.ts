import * as Q from 'q';
import {ModelTreeGridItem, UserTreeGridItemType} from '../browse/ModelTreeGridItem';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';
import {ModelItemStatisticsHeader} from './ModelItemStatisticsHeader';
import {Component} from '../schema/Component';
import {TextArea} from '@enonic/lib-admin-ui/ui/text/TextArea';
import {Schema} from '../schema/Schema';
import {Site} from '../schema/Site';
import {Styles} from '../schema/Styles';
import {RenderableApplication} from '../application/RenderableApplication';

export class ModelItemStatisticsPanel
    extends ItemStatisticsPanel {

    private readonly header: ModelItemStatisticsHeader;

    private readonly textArea: TextArea;

    constructor() {
        super('model-item-statistics-panel');

        this.header = new ModelItemStatisticsHeader();
        this.textArea = new TextArea('descriptor-area');
        this.textArea.hide();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.appendChild(this.header);
            this.appendChild(this.textArea);

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
        const component = item.getComponent();
        const application = item.getApplication();
        const schema = item.getSchema();
        const site = item.getSite();
        const styles = item.getStyles();


        if (item.isComponent() || item.isSchema() || item.isSite() || item.isStyles() || item.isApplication()) {
            this.setResource(component || schema || site || styles || application);
            this.textArea.show();
        } else {
            this.textArea.hide();
        }
    }

    private setResource(item: Component | Schema | Site | Styles | RenderableApplication): void {
        this.textArea.setValue(item.getResource());
    }
}
