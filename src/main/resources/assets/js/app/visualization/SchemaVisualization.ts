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
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

export class SchemaVisualization extends DivEl{
    public appKey: string;
    private onNavigationListeners: FnSchemaNavigationListener[] = [];
    private centralNodeInfo: CentralNodeInfo;
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
    private static readonly hideOnRefClassName = 'hide-on-red';
    private static readonly inputID = 'SearchInput';
    private static readonly checkboxID = 'ShowReferencesCheckbox';
    private static readonly breadcrumbsID = 'Breadcrumbs';
    private static readonly centralNodeID = 'CentralNode';
    private static readonly backArrowID = 'BackArrow';
    private static readonly referencesID = 'Relations';
    private static readonly textsAndIconsID = 'TextsAndIcons';
    private static readonly innerCircleID = 'InnerSVG';
    private static readonly outerCircleID = 'OuterSVG';
    private static readonly iconFallbackKey = 'FOLDER';
    private static readonly iconBasePath = '/icons/visualization/';
    private static readonly iconPaths = {
        FOLDER: 'folder.png',
        PART:'parts.png',
        PAGE:'pages.png',
        LAYOUT:'layouts.png',
        CONTENT_TYPE:'content-types.png',
        MIXIN:'mixins.png',
        XDATA:'x-data.png',
    };
    
    constructor(className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));
    }

    setData(appKey?: string, centralNodeInfo?: CentralNodeInfo, onLoadStart: () => void = () => {}, onLoadEnd: () => void = () => {}) {
        this.appKey = appKey;
        this.centralNodeInfo = centralNodeInfo;
        this.referencesCheckbox = createInput(SchemaVisualization.checkboxID, 'checkbox', 'Show References');
        this.searchInput = createInput(SchemaVisualization.inputID, 'text', 'Search');
        this.breadcrumbs = this.createBreadcrumbs();
        this.onLoadStart = onLoadStart;
        this.onLoadEnd = onLoadEnd;
    }

    private createBreadcrumbs() {
        return new DivEl().appendChild(new PEl().setId(SchemaVisualization.breadcrumbsID));
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

    private loadReferences(appKey: string): Q.Promise<{ references: Relation[] }> {
        return new ReferencesRequest<{references: Relation[]}>(appKey).sendAndParse();
    }

    private setSchemaRender(schemaData: SchemaData) {        
        this.schemaRender = new SchemaRender(
            schemaData.getRelations(), 
            schemaData.getNodes(), 
            schemaData.getFirstNode(), 
            this.getRenderConfig(schemaData),
            this.centralNodeInfo
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
                centralNode: SchemaVisualization.centralNodeID,
                search: SchemaVisualization.inputID,
                checkbox: SchemaVisualization.checkboxID,
                breadcrumbs: SchemaVisualization.breadcrumbsID,
                backArrow: SchemaVisualization.backArrowID,
                references: SchemaVisualization.referencesID,
                textsAndIcons: SchemaVisualization.textsAndIconsID,
                innerCircle: SchemaVisualization.innerCircleID,
                outerCircle: SchemaVisualization.outerCircleID,
            },
            icons: {
                paths: SchemaVisualization.iconPaths,
                fallbackKey: SchemaVisualization.iconFallbackKey,
                basePath: CONFIG.getString('assetsUri') + SchemaVisualization.iconBasePath
            },
            circle: {
                radius: getOuterCircleRadius(schemaData.getNodes()),
                color: SchemaVisualization.circleColor,
            },
            text: {
                size: getOuterTextSize(schemaData.getNodes()),
                hoverColor: SchemaVisualization.hoverColor
            },
            classnames: {
                hideOnRef: SchemaVisualization.hideOnRefClassName,
            },
            references: {
                opacity: SchemaVisualization.referencesOpacity,
            },
            marker: {
                size: SchemaVisualization.markerSize,
            },
            children: {
                many: 20,
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

    navigateToNode(nodeId: string): void {
        this.schemaRender.navigateToNode(nodeId);
    }

    onNavigate(fn: FnSchemaNavigationListener): void {
        this.onNavigationListeners.push(fn);
    }
}

function createInput(id: string, type: string, label: string = ''): DivEl {
    const classNames = type === 'text'  ? 'xp-admin-common-text-input xp-admin-middle' : '';
    const inputEl = new InputEl(classNames, type).setId(id);
    const labelEL = new LabelEl(label);
    labelEL.getHTMLElement().setAttribute('for', id);
    return new DivEl().appendChildren(labelEL, inputEl);
}
