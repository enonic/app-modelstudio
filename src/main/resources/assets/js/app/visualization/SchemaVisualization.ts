import * as Q from 'q';
import * as d3 from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {D3SVG, FnSchemaNavigationListener, Relation} from './interfaces';
import SchemaData from './SchemaData';
import SchemaRender from './SchemaRender';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {PEl} from '@enonic/lib-admin-ui/dom/PEl';
import {ReferencesRequest} from './ReferencesRequest';

export class SchemaVisualization extends DivEl{
    private appKey: string;
    private svgContainerId: string = 'SvgContainer';
    private schemaRender: SchemaRender;
    private searchInput: DivEl;
    private referencesCheckbox: DivEl;
    private breadcrumbs: DivEl;

    constructor(appKey: string, className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));

        this.appKey = appKey;
        this.referencesCheckbox = createInput('ShowReferencesCheckbox', 'checkbox', 'Show References');
        this.searchInput = createInput('SearchInput', 'text');
        this.breadcrumbs = this.createBreadcrumbs();
    }

    private createBreadcrumbs() {
        return new DivEl().appendChild(new PEl().setId('Breadcrumbs'));
    }

    private getHeader(): DivEl {
        const header = new DivEl('header');
        header.appendChild(this.searchInput);
        header.appendChild(this.referencesCheckbox);
        header.appendChild(this.breadcrumbs);
        return header;
    }

    private createSVGContainer(): DivEl {
        return new DivEl().setId(this.svgContainerId);
    }

    private createSVG(width: number, height: number): D3SVG {
        const svgViewBox = [-width/2, -height/2, width, height];
        
        return d3.select(`#${this.svgContainerId}`).append('svg').attr('viewBox', svgViewBox);
    }

    private setData(appKey: string): Q.Promise<void> {
        return new ReferencesRequest<{references: Relation[]}>(appKey).sendAndParse().then(data => {
            const schemaData = new SchemaData(data.references);
            this.schemaRender = new SchemaRender(schemaData.getRelations(), schemaData.getNodes(), schemaData.getFirstNode());
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(() => {
            return this.setData(this.appKey).then(() => {
                this.appendChild(this.getHeader());
                this.appendChild(this.createSVGContainer());
                this.schemaRender.execute(this.createSVG(600, 600));

                return true;
            });
        });
    }

    public navigateToNode(nodeId: string): void {
        this.schemaRender.navigateToNode(nodeId);
    }

    public onNavigation(fn: FnSchemaNavigationListener): void {
        this.schemaRender.addOnNavigationListener(fn);
    }
}

function createInput(id: string, type: string, label: string = ''): DivEl {
    const inputEl = new InputEl('', type).setId(id);
    const labelEL = new LabelEl(label);
    labelEL.getHTMLElement().setAttribute('for', id);
    return new DivEl().appendChildren(inputEl, labelEL);
}
