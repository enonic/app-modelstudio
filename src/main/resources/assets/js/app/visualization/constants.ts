import {i18n} from '@enonic/lib-admin-ui/util/Messages';

const getPhrases = () => ({
    filterPlaceholder: i18n('visualization.input.label.filter'),
    referencesLabel: i18n('visualization.input.label.references'),
    navigateBack: i18n('visualization.tooltip.navigation.back'),
});

const CLASSES = {
    filterWrapper: 'filter-wrapper',
    filterInput: 'filter-input',
    filterIcon: 'icon-close',

    referencesWrapper: 'references-wrapper',
    referencesInput: 'references-checkbox',
    referencesIcon: 'icon-link',

    breadcrumbsWrapper: 'breadrcrumbs-wrapper',
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

const getRenderConfig = () => ({
    phrases: getPhrases(),
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
});

export {
    CLASSES,
    getPhrases,
    getRenderConfig
};