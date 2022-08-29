import * as Q from 'q';
import * as d3 from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {D3SVG, Relation} from './interfaces';
import SchemaData from './SchemaData';
import SchemaRender from './SchemaRender';
import {InputEl} from '@enonic/lib-admin-ui/dom/InputEl';
import {LabelEl} from '@enonic/lib-admin-ui/dom/LabelEl';
import {PEl} from '@enonic/lib-admin-ui/dom/PEl';

export class SchemaVisualization extends DivEl{

    svgContainerId: string = 'SvgContainer';
    schemaRender: SchemaRender;

    searchInput: DivEl;
    referencesCheckbox: DivEl;
    breadcrumbs: DivEl;

    constructor(relations: Relation[], className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));

        const schemaData = new SchemaData(relations);

        this.schemaRender = new SchemaRender(schemaData.getRelations(), schemaData.getNodes(), schemaData.getFirstNode());
        this.referencesCheckbox = this.createInput('ShowReferencesCheckbox', 'checkbox', 'Show References');
        this.searchInput = this.createInput('SearchInput', 'text');
        this.breadcrumbs = this.createBreadcrumbs();
    }

    private createInput(id: string, type: string, label: string = ''): DivEl {
        const inputEl = new InputEl('', type).setId(id);
        const labelEL = new LabelEl(label);
        labelEL.getHTMLElement().setAttribute('for', id);

        return new DivEl().appendChildren(inputEl, labelEL);
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

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {

            this.appendChild(this.getHeader());
            this.appendChild(this.createSVGContainer());
            this.schemaRender.execute(this.createSVG(600, 400));

            return rendered;
        });
    }
}
