import * as Q from 'q';
import {select} from 'd3';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {CentralNodeInfo, D3SVG, FnSchemaNavigationListener, Relation} from './interfaces';
import {Data} from './data/Data';
import {Request} from './data/Request';
import {SVGRender} from './render/SVGRender';
import {Header} from './header/Header';
import {ModelTreeGridItem} from '../browse/ModelTreeGridItem';
import {CLASSES, getPhrases} from './constants';

export class Visualization extends DivEl{
    public appKey: string;
    private onNavigationListeners: FnSchemaNavigationListener[] = [];
    private svgContainerId: string = 'SvgContainer';
    private svgRender: SVGRender;
    private isLoading: boolean;
    private onLoadStart: () => void;
    private onLoadEnd: () => void;
    
    constructor(className?: string) {
        super('schema-visualization' + (className ? ' ' + className : ''));
    }

    setData(appKey?: string,  onLoadStart: () => void = () => {}, onLoadEnd: () => void = () => {}) {
        if (this.isLoading) {
            return false;
        }
        this.appKey = appKey;
        this.onLoadStart = onLoadStart;
        this.onLoadEnd = onLoadEnd;
    }

    private createSVGContainer(): DivEl {
        return new DivEl().setId(this.svgContainerId);
    }

    private createSVG(width: number, height: number): D3SVG {
        const svgViewBox = [-width/2, -height/2, width, height];
        return select(`#${this.svgContainerId}`).append('svg').attr('viewBox', svgViewBox);
    }

    private setSvgRender(schemaData: Data, header: Header) {        
        this.svgRender = new SVGRender(
            schemaData.getRelations(), 
            schemaData.getNodes(), 
            schemaData.getFirstNode(),
            header
        );

        this.onNavigationListeners.forEach(fn => this.svgRender.addOnNavigationListener(fn));
    }

    private getErrorDiv(): DivEl {
        return new DivEl(CLASSES.errorMessageWrapper).setHtml(getPhrases().errorMessage);
    }
    
    private execute(): Q.Promise<boolean> {
        this.isLoading = true;
        this.removeChildren();
        this.onLoadStart();
        
        return new Request<{references: Relation[]}>(this.appKey)
            .sendAndParse()
            .then(data => {
                const header = new Header();
                this.setSvgRender(new Data(data.references), header);
                this.appendChild(header);
                this.appendChild(this.createSVGContainer());
                this.svgRender.execute(this.createSVG(700, 600));

                return header;
            })
            .catch(error => {
                console.error(error);

                if (this.getChildren().length > 0) {
                    this.removeChildren();
                }

                this.appendChild(this.getErrorDiv());

                return false;
            })
            .finally(() => {
                this.isLoading = false;
                this.onLoadEnd();
            });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then(() => {
            if (this.isLoading || !this.appKey) {
                return true;
            }

            return this.execute();
        });
    }

    navigateToNode(item: ModelTreeGridItem, nodeId: string, centralNodeInfo: CentralNodeInfo, skipCentralNodeUpdate: boolean = false)
        : void {
        this.svgRender.setBreadcrumbsInfo(item.getDisplayName(), nodeId);

        if (!skipCentralNodeUpdate) {
            this.svgRender.updateCentralNodeInfo(centralNodeInfo);
        }
        
        this.svgRender.navigateToNode(nodeId);
    }

    onNavigate(fn: FnSchemaNavigationListener): void {
        this.onNavigationListeners.push(fn);
    }
}

