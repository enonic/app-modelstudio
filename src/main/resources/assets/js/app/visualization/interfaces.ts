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
    name: string
    subname: string
    icon: string
}

export interface RenderConfig {
    references: {
        opacity: number
    },
    text: {
        size: number
    },
    marker: {
        size: number
    },
    circle: {
        radius: number
    },
    ids: {
        search: string
        checkbox: string
        breadcrumbs: string
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
        relations: Relation[],
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