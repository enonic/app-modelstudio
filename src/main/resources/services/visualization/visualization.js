const schemaLib = require('/lib/xp/schema');
const contentLib = require('/lib/xp/content');
const appLib = require('/lib/xp/app');
const applicationWildcardResolver = __.newBean('com.enonic.xp.app.visualization.lib.ApplicationWildcardResolver');

exports.get = function handleGet(req) {
    if (!req.params.appKey) {
        return {
            status: 400,
        };
    }

    return {
        status: 200,
        contentType: 'application/json',
        body: {
            references: getReferences(req.params.appKey),
            details: getDetails(req.params.appKey)
        }
    };
}

const SCHEMA_NAMES = {
    CONTENTTYPE: 'content-types',
    MIXIN: 'mixins',
    XDATA: 'x-data',
    PAGE: 'pages',
    LAYOUT: 'layouts',
    PART: 'parts'
}

function libSchemaSchemaTypeMapper(key) {
    return {
        [SCHEMA_NAMES.CONTENTTYPE]: 'CONTENT_TYPE',
        [SCHEMA_NAMES.MIXIN]: 'MIXIN',
        [SCHEMA_NAMES.XDATA]: 'XDATA'
    }[key];
}

function libSchemaComponentTypeMapper(key) {
    return {
        [SCHEMA_NAMES.PAGE]: 'PAGE',
        [SCHEMA_NAMES.LAYOUT]: 'LAYOUT',
        [SCHEMA_NAMES.PART]: 'PART'
    }[key];
}

function inverseMapper(key) {
    return {
        CONTENT_TYPE: SCHEMA_NAMES.CONTENTTYPE,
        MIXIN: SCHEMA_NAMES.MIXIN,
        XDATA: SCHEMA_NAMES.XDATA,
        PAGE: SCHEMA_NAMES.PAGE,
        LAYOUT: SCHEMA_NAMES.LAYOUT,
        PART: SCHEMA_NAMES.PART,
    }[key];
}

function getDetails(appKey) {
    const schemaCategories = [SCHEMA_NAMES.CONTENTTYPE, SCHEMA_NAMES.MIXIN, SCHEMA_NAMES.XDATA];
    const componentCategories = [SCHEMA_NAMES.PAGE, SCHEMA_NAMES.LAYOUT, SCHEMA_NAMES.PART];

    const hash = {};
    
    setAppDetails(appKey, hash);
    setCategoriesDetails(appKey, schemaCategories.concat(componentCategories), hash);
    setSchemaDetails(appKey, schemaCategories, hash);
    setComponentDetails(appKey, componentCategories, hash);

    return hash;
}

function setAppDetails(appKey, hash) {
    const application = appLib.get({key: appKey});

    hash[appKey] = {
        key: application.key,
        displayName: application.displayName,
        type: 'application'
    }
}

function setCategoriesDetails(appKey, categories, hash) {
    categories.forEach(type => {
        const key = getCategoriesUid(appKey, type);

        hash[key] = {
            key: key,
            displayName: type,
            type: ''
        }
    });
}

function setSchemaDetails(appKey, schemaCategories, hash) {
    schemaCategories.forEach(type => {
        const names = schemaLib.listSchemas({ application: appKey, type: libSchemaSchemaTypeMapper(type) }).map(schema => schema.name);
        const schemas = names.map(name => schemaLib.getSchema({ name, type: libSchemaSchemaTypeMapper(type) }));
        
        schemas.forEach(schema => {
            if (!hash[schema.name]) {
                const key = getSchemaUid(schema.type, schema.name, true);

                hash[key] = {
                    key: schema.name,
                    displayName: schema.displayName,
                    type: inverseMapper(schema.type)
                }
            }
        });
    });
}

function setComponentDetails(appKey, componentCategories, hash) {
    componentCategories.forEach(type => {
        const names = schemaLib.listComponents({ application: appKey, type: libSchemaComponentTypeMapper(type) }).map(component => component.key);
        const components = names.map(name => schemaLib.getComponent({ key: name, type: libSchemaComponentTypeMapper(type) }));

        components.forEach(component => {
            if (!hash[component.key]) {
                const key = getSchemaUid(component.type, component.key, true);
                
                hash[key] = {
                    key: component.key,
                    displayName: component.displayName,
                    type: inverseMapper(component.type)
                }
            }
        });
    });    
}

function getReferences(appKey) {
    const schemaCategories = [SCHEMA_NAMES.CONTENTTYPE, SCHEMA_NAMES.MIXIN, SCHEMA_NAMES.XDATA];
    const componentCategories = [SCHEMA_NAMES.PAGE, SCHEMA_NAMES.LAYOUT, SCHEMA_NAMES.PART];
    const categories = [].concat(schemaCategories).concat(componentCategories).map(c => getCategoriesUid(appKey, c));
    const schemaNamesAndReferences = schemaCategories.map(schemaCategory => getSchemaNamesAndReferences(appKey, schemaCategory));
    const componentNamesAndReferences = componentCategories.map(componentCategory => getComponentNamesAndReferences(appKey, componentCategory));

    const namesAndReferences = []
    .concat(schemaNamesAndReferences)
    .concat(componentNamesAndReferences)
    .reduce((prev, curr) => ({
        names: prev.names.concat(curr.names),
        references: prev.references.concat(curr.references)
    }));

    const baseContentTypeNames = getBaseContentTypeNames(appKey);
    const allNames = namesAndReferences.names.concat(baseContentTypeNames);
    const allRefs = namesAndReferences.references.filter(reference => allNames.indexOf(reference[1]) > -1);
    const referencedBaseContentTypeNames = baseContentTypeNames.filter(name => allRefs.some(reference => name === reference[1]));
    const baseContentTypeReferences = referencedBaseContentTypeNames.map(name => [getCategoriesUid(appKey, SCHEMA_NAMES.CONTENTTYPE), name]);

    const refs = [].concat(baseContentTypeReferences).concat(allRefs);

    let initialRefs = cartesianProduct([appKey], categories);

    const references = initialRefs
    .concat(refs)
    .map(reference => ({source: reference[0], target: reference[1]}));

    return references;
}

function getBaseContentTypeIds() {
    const allTypeNames = contentLib.getTypes().map(type => type.name);

    return allTypeNames.filter(name => {
        const left = name.split(':')[0];
        return left === 'base' || left === 'media' || left === 'portal';
    });
}

function getBaseContentTypeNames(appKey) {
    const baseContentTypeUids = getBaseContentTypeIds().map(name => getBaseContentTypeUid(appKey, SCHEMA_NAMES.CONTENTTYPE, name));
    return baseContentTypeUids;
}

function getSchemaNamesAndReferences(appKey, type) {
    const names = schemaLib.listSchemas({ application: appKey, type: libSchemaSchemaTypeMapper(type) }).map(schema => schema.name);
    const namesWithUid = names.map(name => getSchemaUid(type, name));
    const schemas = names.map(name => schemaLib.getSchema({ name, type: libSchemaSchemaTypeMapper(type) }));

    return {names: namesWithUid, references: buildReferences(appKey, type, namesWithUid, schemas)};
}

function getComponentNamesAndReferences(appKey, type) {
    const names = schemaLib.listComponents({ application: appKey, type: libSchemaComponentTypeMapper(type) }).map(component => component.key);
    const namesWithUid = names.map(name => getSchemaUid(type, name));
    const components = names.map(name => schemaLib.getComponent({ key: name, type: libSchemaComponentTypeMapper(type) }));
    
    return {names: namesWithUid, references: buildReferences(appKey, type, namesWithUid, components)};
}

function buildReferences(appKey, type, names, schemas) {
    let references = cartesianProduct([getCategoriesUid(appKey, type)], names);

    getRegExps().forEach(obj => {
        const targetType = obj.targetType;
        const regExp = obj.regExp;
        const fnReplace = obj.fnReplace;

        const relations = schemas.reduce((prev, curr) => {
            const regExpMatches = curr.resource.match(regExp) || [];

            const id = str => prependAppKey(appKey, fnReplace(str));
            const targetUid = str => getSchemaUid(targetType, id(str));

            const sourceUid = getSchemaUid(type, curr.name || curr.key);

            const matches = getMatches(appKey, regExpMatches.map(fnReplace)).map(targetUid);
            
            return regExpMatches.length > 0 ? prev.concat(cartesianProduct([sourceUid], matches)) : prev;
        }, []);
    
        references = references.concat(relations);
    });

    return references;
}

// https://developer.enonic.com/docs/xp/stable/cms/input-types#allowContentType
function getMatches(appKey, initialMatches) {
    if (initialMatches.length === 0) {
        return [];
    }

    const schemaIds = schemaLib.listSchemas({ application: appKey, type: 'CONTENT_TYPE' })
        .map(schema => schemaLib.getSchema({ name: schema.name, type: 'CONTENT_TYPE' }))
        .map(schema => schema.name || schema.key || '');
        
    let additionalMatches = [];

    initialMatches.forEach(matchId => {
        const matches = __.toNativeObject(applicationWildcardResolver.matches_multiple(appKey, matchId, schemaIds));
        additionalMatches = additionalMatches.concat(matches);
    });

    return initialMatches
        .concat(additionalMatches)
        .map(schemaName => schemaName.split(':').pop());
}

function getRegExps() {
    return [
        {
            targetType: SCHEMA_NAMES.CONTENTTYPE,
            regExp: new RegExp('<allowContentType>(.*?)<\/allowContentType>', 'g'),
            fnReplace: (str) => str.replace(/<\/?allowContentType>/g, '')
        },
        {
            targetType: SCHEMA_NAMES.CONTENTTYPE,
            regExp: new RegExp('<allow-content-type>(.*?)<\/allow-content-type>', 'g'),
            fnReplace: (str) => str.replace(/<\/?allow-content-type>/g, '')
        },
        {
            targetType: SCHEMA_NAMES.CONTENTTYPE,
            regExp: new RegExp('<allow-on-content-type>(.*?)<\/allow-on-content-type>', 'g'),
            fnReplace: (str) => str.replace(/<\/?allow-on-content-type>/g, '')
        },
        {
            targetType: SCHEMA_NAMES.MIXIN,
            regExp: new RegExp('<mixin name="(.*?)"\\s?\/>', 'g'),
            fnReplace: (str) => str.replace(/<mixin name=\"/g, '').replace(/\"\s?\/>/g, '')
        },
    ]
}

function cartesianProduct(arr1, arr2) {
    return arr1.reduce((prev, curr) => prev.concat(arr2.map(v2 => [curr, v2])), []);
}

function prependAppKey(appKey, str) {
    return appKey + ':' + str;
}

function getUid(appKey = '', type = '', id = '') {
    return [appKey, type, id].filter(item => !!item).join('/');
}

function getCategoriesUid(appKey, type) {
    return getUid(appKey, type);
}

function getSchemaUid(type, id, useInverseMapper = false) {
    const t = useInverseMapper ? inverseMapper(type) : type;
    return getUid('', t, id);
}

function getBaseContentTypeUid(appKey, type, name) {
    return getUid('', type, prependAppKey(appKey, name));
}