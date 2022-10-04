export interface Relation {
    source: string,
    target: string,
    dash?: boolean
}

export interface Node {
    id: string,
    depth: number
}

export interface CentralNodeInfo {
    name: string,
    icon: string
}

export interface RenderConfig {
    references: {
        opacity: number
    },
    text: {
        size: number
        hoverColor: string
    },
    marker: {
        size: number
    },
    circle: {
        radius: number
        color: string
    },
    classnames: {
        hideOnRef: string
    },
    ids: {
        centralNode: string
        search: string
        checkbox: string
        breadcrumbs: string
        backArrow: string
        references: string
        textsAndIcons: string
        innerCircle: string
        outerCircle: string
    },
    children: {
        many: number
    },
    icons: { 
        fallbackKey: string
        basePath: string
        paths: { [key: string]: string }
    }
}

export interface RenderOption {
    data: {
        node?: Node,
        childrenIds: string[],
        relations: Relation[],
        techAppName?: string
    },
    config: {
        id: string,
        class?: string
        text: { size: number },
        circle: { radius: number }
    },
}

export type FnSchemaNavigationListener = (appKey: string, nodeId: string, prevNodeId?: string) => void;

export type D3SVG = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>; 

export type D3SVGG = d3.Selection<SVGGElement, unknown | string, HTMLElement | SVGGElement, any>;