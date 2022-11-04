export interface Relation {
    source: string,
    target: string,
    dash?: boolean
}

export interface Node {
    id: string,
    depth: number,
    clickable: boolean,
}

export interface CentralNodeInfo {
    name: string
    subname: string
    icon: string
}

export interface SVGRenderOptionsConfig { 
    circleRadius: number, 
    textSize: number 
}

export interface RenderConfig {
    phrases: {
        filterPlaceholder: string
        referencesLabel: string
        navigateBack: string
    },
    references: {
        opacity: number
    },
    marker: {
        size: number
    },
    children: {
        many: number
    }
    colors: {
        primary: string
        secondary: string
        fallback: string
        range: Array<string>
    }
}

export interface RenderOption {
    data: {
        node?: Node,
        childrenIds: string[],
        childrenIdsToShow: string[],
        relations: Relation[],
    },
    config: {
        id: string,
        class?: string
        text: { size: number },
        circle: { radius: number }
    },
}

export type BreadcrumbsItem  = {nodeName: string, nodeId: string};

export type FnSchemaNavigationListener = (appKey: string, nodeId: string, prevNodeId?: string) => void;

export type D3SVG = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>; 

export type D3SVGG = d3.Selection<SVGGElement, unknown | string, HTMLElement | SVGGElement, any>;