import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {RenderConfig} from './interfaces';

const PHRASES = () => ({
    filterPlaceholder: i18n('visualization.input.label.filter'),
    referencesLabel: i18n('visualization.input.label.references'),
    navigateBack: i18n('visualization.tooltip.navigation.back'),
});

const IDS = {
    search: 'filter-input',
    checkbox: 'references-checkbox',
    breadcrumbs: 'breadcrumbs'
};

const REFERENCES_OPACITY = 0.05;

const MARKER_SIZE = 5;

const IS_MANY_CHILDREN = 10;

const COLORS = {
    primary: '#3e3e3e',
    secondary: '#808080',
    fallback: '#ededed',
    range: [
        '#d3d3d3',
        '#ff7f0e', // Content Type
        '#2ca02c', // Mixins
        '#e91e63', // XDatas
        '#2fb6a3', // Pages
        '#000000', // Layouts
        '#1f77b4', // Parts
    ]
};

const RENDER_CONFIG: RenderConfig = {
    phrases: PHRASES(),
    ids: IDS,
    
    references: {
        opacity: REFERENCES_OPACITY,
    },
    marker: {
        size: MARKER_SIZE,
    },
    children: {
        many: IS_MANY_CHILDREN,
    },
    colors: COLORS
};

export {
    PHRASES,
    IDS,
    RENDER_CONFIG
};