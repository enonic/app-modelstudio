export interface Relation {
    source: string,
    target: string,
    dash?: boolean
}

export interface Node {
    id: string,
    depth: number
}

export enum Icons {
    FOLDER = 'folder.png',
    PART = 'parts.png',
    PAGE = 'pages.png',
    LAYOUT = 'layouts.png',
    CONTENT_TYPE = 'content-types.png',
    MIXIN = 'mixins.png',
    XDATA = 'x-data.png',
}

export interface RenderGlobalConfig {
    references: {
        opacity: number,
    },
    text: {
        size: number
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
        centralNode: string,
        search: string,
        checkbox: string,
        breadcrumbs: string,
        backArrow: string,
        references: string,
        textsAndIcons: string,
        innerCircle: string,
        outerCircle: string,
    },
    children: {
        many: number
    },
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

export type D3SVG = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>; 

export type D3SVGG = d3.Selection<SVGGElement, unknown | string, HTMLElement | SVGGElement, any>;