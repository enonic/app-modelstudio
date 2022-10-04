import * as Q from 'q';
import * as d3 from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {CentralNodeInfo, D3SVG, FnSchemaNavigationListener, Relation} from './interfaces';
import SchemaData from './SchemaData';
import SchemaRender from './SchemaRender';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {PEl} from '@enonic/lib-admin-ui/dom/PEl';
import {ReferencesRequest} from './ReferencesRequest';

export class SchemaVisualization extends DivEl{
    public appKey: string;
    private centralNodeInfo: CentralNodeInfo;
    private svgContainerId: string = 'SvgContainer';
    private schemaRender: SchemaRender;
    private searchInput: DivEl;
    private referencesCheckbox: DivEl;
    private breadcrumbs: DivEl;
    private onLoadStart: () => void;
    private onLoadEnd: () => void;
    
    constructor(
        appKey: string, 
        centralNodeInfo?: CentralNodeInfo,
        className?: string,
        onLoadStart: () => void = () => {},
        onLoadEnd: () => void = () => {}
    ) {
        super('schema-visualization' + (className ? ' ' + className : ''));

        this.appKey = appKey;
        this.centralNodeInfo = centralNodeInfo;
        this.referencesCheckbox = createInput('ShowReferencesCheckbox', 'checkbox', 'Show References');
        this.searchInput = createInput('SearchInput', 'text', 'Search');
        this.breadcrumbs = this.createBreadcrumbs();

        this.onLoadStart = onLoadStart;
        this.onLoadEnd = onLoadEnd;
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
        this.onLoadStart();
        return new ReferencesRequest<{references: Relation[]}>(appKey).sendAndParse().then(data => {
            const schemaData = new SchemaData(data.references);
            this.schemaRender = new SchemaRender(
                schemaData.getRelations(), 
                schemaData.getNodes(), 
                schemaData.getFirstNode(), 
                this.centralNodeInfo
            );
            this.onLoadEnd();
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(() => {
            return this.setData(this.appKey).then(() => {
                this.appendChild(this.getHeader());
                this.appendChild(this.createSVGContainer());
                this.schemaRender.execute(this.createSVG(700, 600));

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
    const classNames = type === 'text'  ? 'xp-admin-common-text-input xp-admin-middle' : '';
    const inputEl = new InputEl(classNames, type).setId(id);
    const labelEL = new LabelEl(label);
    labelEL.getHTMLElement().setAttribute('for', id);
    return new DivEl().appendChildren(labelEL, inputEl);
}
