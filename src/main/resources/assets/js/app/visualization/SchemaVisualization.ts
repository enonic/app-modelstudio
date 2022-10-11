import * as Q from 'q';
import * as d3 from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {CentralNodeInfo, D3SVG, FnSchemaNavigationListener, Relation, RenderConfig} from './interfaces';
import SchemaData from './SchemaData';
import SchemaRender from './SchemaRender';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {PEl} from '@enonic/lib-admin-ui/dom/PEl';
import {ReferencesRequest} from './ReferencesRequest';
import {getOuterCircleRadius, getOuterTextSize} from './helpers';

export class SchemaVisualization extends DivEl{
    public appKey: string;
    private onNavigationListeners: FnSchemaNavigationListener[] = [];
    private svgContainerId: string = 'SvgContainer';
    private schemaRender: SchemaRender;
    private searchInput: DivEl;
    private referencesCheckbox: DivEl;
    private breadcrumbs: DivEl;
    private onLoadStart: () => void;
    private onLoadEnd: () => void;

    private static readonly referencesOpacity = 0.1;
    private static readonly markerSize = 5;
    private static readonly circleColor = 'lightgray';
    private static readonly hoverColor = 'lightgray';
    private static readonly fallbackColor = 'gray';
    private static readonly inputID = 'search-input';
    private static readonly checkboxID = 'references-checkbox';
    private static readonly breadcrumbsID = 'breadcrumbs';
    
    constructor(className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));

        this.referencesCheckbox = createInput(SchemaVisualization.checkboxID, 'checkbox', 'References');
        this.searchInput = createInput(SchemaVisualization.inputID, 'text', '', 'Filter');
        this.breadcrumbs = this.createBreadcrumbs();
    }

    setData(appKey?: string,  onLoadStart: () => void = () => {}, onLoadEnd: () => void = () => {}) {
        this.appKey = appKey;
        this.onLoadStart = onLoadStart;
        this.onLoadEnd = onLoadEnd;
    }

    private createBreadcrumbs() {
        return new DivEl().appendChild(new PEl().setId(SchemaVisualization.breadcrumbsID));
    }

    private getHeader(): DivEl {
        const header = new DivEl('header');
        header.appendChild(this.searchInput);
        header.appendChild(this.breadcrumbs);
        header.appendChild(this.referencesCheckbox);
        return header;
    }

    private createSVGContainer(): DivEl {
        return new DivEl().setId(this.svgContainerId);
    }

    private createSVG(width: number, height: number): D3SVG {
        const svgViewBox = [-width/2, -height/2, width, height];
        return d3.select(`#${this.svgContainerId}`).append('svg').attr('viewBox', svgViewBox);
    }

    private loadReferences(appKey: string): Q.Promise<{ references: Relation[] }> {
        return new ReferencesRequest<{references: Relation[]}>(appKey).sendAndParse();
    }

    private setSchemaRender(schemaData: SchemaData) {        
        this.schemaRender = new SchemaRender(
            schemaData.getRelations(), 
            schemaData.getNodes(), 
            schemaData.getFirstNode(), 
            this.getRenderConfig(schemaData)
        );

        this.onNavigationListeners.forEach(fn => this.schemaRender.addOnNavigationListener(fn));
    }

    private execute(): Q.Promise<void> {
        return this.loadReferences(this.appKey)
            .then(data => new SchemaData(data.references))
            .then(schemaData => this.setSchemaRender(schemaData))
            .then(() => {
                this.appendChild(this.getHeader());
                this.appendChild(this.createSVGContainer());
                this.schemaRender.execute(this.createSVG(700, 600));
            });
    }

    private getRenderConfig(schemaData: SchemaData) {
        const config: RenderConfig = {
            ids: {
                search: SchemaVisualization.inputID,
                checkbox: SchemaVisualization.checkboxID,
                breadcrumbs: SchemaVisualization.breadcrumbsID,
            },
            circle: {
                radius: getOuterCircleRadius(schemaData.getNodes()),
                color: SchemaVisualization.circleColor,
            },
            text: {
                size: getOuterTextSize(schemaData.getNodes()),
                fallbackColor: SchemaVisualization.fallbackColor,
                hoverColor: SchemaVisualization.hoverColor
            },
            references: {
                opacity: SchemaVisualization.referencesOpacity,
            },
            marker: {
                size: SchemaVisualization.markerSize,
            },
            children: {
                many: 10,
            },
        };
        
        return config;
    }

    refresh(): void {
        this.removeChildren();
        this.doRender();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(() => {

            if (!this.appKey) {
                return true;
            }

            this.onLoadStart();
            this.execute().then(this.onLoadEnd);
            
            return true;
        });
    }

    navigateToNode(nodeId: string, centralNodeInfo: CentralNodeInfo): void {
        this.schemaRender.updateCentralNodeInfo(centralNodeInfo);
        this.schemaRender.navigateToNode(nodeId);
    }

    onNavigate(fn: FnSchemaNavigationListener): void {
        this.onNavigationListeners.push(fn);
    }

    updateCentralNodeInfo(centralNodeInfo: CentralNodeInfo): void {
        this.schemaRender.updateCentralNodeInfo(centralNodeInfo);
    }

}

function createInput(id: string, type: string, label: string = '', placeholder: string = ''): DivEl {
    const classNames = type === 'text'  ? 'xp-admin-common-text-input xp-admin-middle' : '';
    const divEL = new DivEl();
    const inputEl = new InputEl(classNames, type).setPlaceholder(placeholder).setId(id);
    const labelEL = label ? new LabelEl(label) : null;
    
    if(labelEL) {
        labelEL.getHTMLElement().setAttribute('for', id);
        divEL.appendChild(labelEL);
    }
    
    return divEL.appendChild(inputEl);
}
