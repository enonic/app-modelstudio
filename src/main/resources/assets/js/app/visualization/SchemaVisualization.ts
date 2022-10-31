import * as Q from 'q';
import {select} from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {CentralNodeInfo, D3SVG, FnSchemaNavigationListener, Relation, RenderConfig} from './interfaces';
import SchemaData from './SchemaData';
import SchemaRender from './SchemaRender';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {ReferencesRequest} from './ReferencesRequest';
import {getOuterCircleRadius, getOuterTextSize} from './helpers';
import {ButtonEl} from '@enonic/lib-admin-ui/dom/ButtonEl';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';

export class SchemaVisualization extends DivEl{
    public appKey: string;
    private onNavigationListeners: FnSchemaNavigationListener[] = [];
    private svgContainerId: string = 'SvgContainer';
    private schemaRender: SchemaRender;
    private searchInput: DivEl;
    private referencesCheckbox: DivEl;
    private breadcrumbs: DivEl;
    private isLoading: boolean;
    private onLoadStart: () => void;
    private onLoadEnd: () => void;

    private static readonly referencesOpacity = 0.05;
    private static readonly markerSize = 5;
    private static readonly lightGrayColor = '#ededed';
    private static readonly blackColor = '#3e3e3e';
    private static readonly grayColor = '#808080';
    private static readonly inputID = 'search-input';
    private static readonly checkboxID = 'references-checkbox';
    private static readonly breadcrumbsID = 'breadcrumbs';
    
    constructor(className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));

        this.referencesCheckbox = createCustomToggleInput(SchemaVisualization.checkboxID, i18n('visualization.input.label.references'));
        this.searchInput = createTextInput(SchemaVisualization.inputID, '', i18n('visualization.input.label.filter'));
        this.breadcrumbs = this.createBreadcrumbs();
    }

    setData(appKey?: string,  onLoadStart: () => void = () => {}, onLoadEnd: () => void = () => {}) {
        if (this.isLoading) {
            return false;
        }
        this.appKey = appKey;
        this.onLoadStart = onLoadStart;
        this.onLoadEnd = onLoadEnd;
    }

    private createBreadcrumbs() {
        return new DivEl().setId(SchemaVisualization.breadcrumbsID);
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
        return select(`#${this.svgContainerId}`).append('svg').attr('viewBox', svgViewBox);
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
            phrases: {
                navigateBack: i18n('visualization.tooltip.navigation.back')
            },
            ids: {
                search: SchemaVisualization.inputID,
                checkbox: SchemaVisualization.checkboxID,
                breadcrumbs: SchemaVisualization.breadcrumbsID,
            },
            circle: {
                radius: getOuterCircleRadius(schemaData.getNodes()),
            },
            text: {
                size: getOuterTextSize(schemaData.getNodes()),
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
            colors: {
                primary: SchemaVisualization.blackColor,
                secondary: SchemaVisualization.grayColor,
                fallback: SchemaVisualization.lightGrayColor,
                range: [
                    '#d3d3d3',
                    '#ff7f0e', // Content Type
                    '#2ca02c', // Mixins
                    '#e91e63', // XDatas
                    '#2fb6a3', // Pages
                    '#000000', // Layouts
                    '#1f77b4', // Parts
                ]
            },
        };
        
        return config;
    }

    refresh(): void {
        if (this.isLoading) {
            return;
        }

        this.removeChildren();
        this.doRender();
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(() => {

            if (!this.appKey) {
                return true;
            }

            this.isLoading = true;
            this.onLoadStart();

            this.execute().then(() => {
                this.onLoadEnd();
                this.isLoading = false;
            });
            
            return true;
        });
    }

    navigateToNode(item: ModelTreeGridItem, nodeId: string, centralNodeInfo: CentralNodeInfo, skipCentralNodeUpdate: boolean = false)
        : void {
        this.schemaRender.setBreadcrumbsInfo(item.getDisplayName(), nodeId);

        if (!skipCentralNodeUpdate) {
            this.schemaRender.updateCentralNodeInfo(centralNodeInfo);
        }
        
        this.schemaRender.navigateToNode(nodeId);
    }

    onNavigate(fn: FnSchemaNavigationListener): void {
        this.onNavigationListeners.push(fn);
    }
}

function createTextInput(id: string, label: string = '', placeholder: string = ''): DivEl {
    const divEL = new DivEl();
    
    const inputEL = new InputEl('', 'text');
    inputEL.setPlaceholder(placeholder);
    inputEL.setId(id);

    const buttonEL = new ButtonEl();
    const spanEL = new SpanEl('icon-close');
    buttonEL.appendChild(spanEL);
    buttonEL.hide();

    const clearInput = () => {
        const inputDOM = document.getElementById(inputEL.getId()) as HTMLInputElement;
        inputDOM.value = '';
        inputDOM.dispatchEvent(new KeyboardEvent('keyup', {'key': 'enter'}));
    };

    buttonEL.onClicked(clearInput);

    if (label) {
        const labelEL = new LabelEl(label);
        labelEL.getHTMLElement().setAttribute('for', id);
        divEL.appendChild(labelEL);
    }

    inputEL.onRendered(() => {
        const inputDOM = document.getElementById(inputEL.getId()) as HTMLInputElement;
        const buttonDOM = document.getElementById(buttonEL.getId()) as HTMLButtonElement;
        
        inputDOM.addEventListener('keyup', (event: Event) => {
            const inputValue = (event.target as HTMLInputElement).value;
            buttonDOM.style.display = inputValue ? '' : 'none';
        });
    });

    divEL.appendChild(inputEL);
    divEL.appendChild(buttonEL);

    return divEL;
}

function createCustomToggleInput(id: string, label: string): DivEl {
    const divEL = new DivEl();
    
    const inputEL = new InputEl('icon-link', 'checkbox');
    inputEL.setId(id);
    
    const labelEL = label ? new LabelEl(label) : null;
    labelEL.getHTMLElement().setAttribute('for', id);

    divEL.appendChild(inputEL);
    divEL.appendChild(labelEL);
    
    return divEL;
}
