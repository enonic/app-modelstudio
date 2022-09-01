const schemaLib = require('/lib/xp/schema');
const contentLib = require('/lib/xp/content');

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
        }
    };
}

function getReferences(appKey) {
    const schemaNamesAndReferences = [
        getSchemaNamesAndReferences(appKey, 'CONTENT_TYPE'),
        getSchemaNamesAndReferences(appKey, 'MIXIN'),
        getSchemaNamesAndReferences(appKey, 'XDATA'),
        getComponentNamesAndReferences(appKey, 'PAGE'),
        getComponentNamesAndReferences(appKey, 'LAYOUT'),
        getComponentNamesAndReferences(appKey, 'PART'),
    ].reduce((prev, curr) => ({
        names: prev.names.concat(curr.names),
        references: prev.references.concat(curr.references)
    }));

    const baseContentTypeNames = getBaseContentTypeNames(appKey);
    const schemaNames = schemaNamesAndReferences.names.concat(baseContentTypeNames);
    const schemaReferences = schemaNamesAndReferences.references.filter(reference => schemaNames.indexOf(reference[1]) >= 0);
    const referencedBaseContentTypeNames = baseContentTypeNames.filter(name => schemaReferences.some(reference => name === reference[1]));
    const baseContentTypeReferences = referencedBaseContentTypeNames.map(name => ['CONTENT_TYPE', name]);

    const references = [
        [[appKey, 'CONTENT_TYPE']],
        [[appKey, 'MIXIN']],
        [[appKey, 'XDATA']],
        [[appKey, 'PAGE']],
        [[appKey, 'LAYOUT']],
        [[appKey, 'PART']],
        baseContentTypeReferences,
        schemaReferences,
    ].reduce((prev, curr) => prev.concat(curr))
    .map(reference => ({source: reference[0], target: reference[1]}));
    
    return references;
}

function getBaseContentTypeNames(appKey) {
    const allTypeNames = contentLib.getTypes().map(type => type.name);

    const baseContentTypeNames = allTypeNames.filter(name => {
        const left = name.split(':')[0];
        return left === 'base' || left === 'media' || left === 'portal';
    });

    const baseContentTypeUids = baseContentTypeNames.map(name => getUid('CONTENT_TYPE', prependAppKey(appKey, name)));

    return baseContentTypeUids;
}

function getSchemaNamesAndReferences(appKey, type) {
    const names = schemaLib.listSchemas({ application: appKey, type }).map(schema => schema.name);
    const namesWithUid = names.map(name => getUid(type, name));
    const schemas = names.map(name => schemaLib.getSchema({ name, type }));

    return {names: namesWithUid, references: buildReferences(appKey, type, namesWithUid, schemas)};
}

function getComponentNamesAndReferences(appKey, type) {
    const names = schemaLib.listComponents({ application: appKey, type }).map(component => component.key);
    const namesWithUid = names.map(name => getUid(type, name));
    const components = names.map(name => schemaLib.getComponent({ key: name, type }));
    
    return {names: namesWithUid, references: buildReferences(appKey, type, namesWithUid, components)};
}

function buildReferences(appKey, type, names, schemas) {
    let references = cartesianProduct([getTitle(type)], names);

    getRegExps().forEach(obj => {
        const targetType = obj.targetType;
        const regExp = obj.regExp;
        const fnReplace = obj.fnReplace;

        const relations = schemas.reduce((prev, curr) => {
            const regExpMatches = curr.resource.match(regExp) || [];

            const id = str => prependAppKey(appKey, fnReplace(str));
            const targetUid = str => getUid(targetType, id(str));

            const sourceUid = getUid(type, curr.name || curr.key);
            
            return regExpMatches.length > 0 ? prev.concat(cartesianProduct([sourceUid], regExpMatches.map(targetUid))) : prev;
        }, []);
    
        references = references.concat(relations);
    });

    return references;
}

function getRegExps() {
    return [
        {
            targetType: 'CONTENT_TYPE',
            regExp: new RegExp('<allow-content-type>(.*?)<\/allow-content-type>', 'g'),
            fnReplace: (str) => str.replace(/<\/?allow-content-type>/g, '')
        },
        {
            targetType: 'CONTENT_TYPE',
            regExp: new RegExp('<allow-on-content-type>(.*?)<\/allow-on-content-type>', 'g'),
            fnReplace: (str) => str.replace(/<\/?allow-on-content-type>/g, '')
        },
        {
            targetType: 'MIXIN',
            regExp: new RegExp('<mixin name=\"(.*?)\"\/>', 'g'),
            fnReplace: (str) => str.replace(/<mixin name=\"/g, '').replace(/\"\/>/g, '')
        },
    ]
}

function cartesianProduct(arr1, arr2) {
    return arr1.reduce((prev, curr) => prev.concat(arr2.map(v2 => [curr, v2])), []);
}

function getTitle(str) {
    return str; //camelize(str.replace(/_/g, ' ')) + 's';
} 

function prependAppKey(appKey, str) {
    return appKey + ':' + str;
}

function getUid(type, id) {
    return `${type}@${id}`;
}

function camelize(str) {
    return str.split(/ |_|-/g).map(word => {
        const firstLetter = word[0];
        const remaningLetters = word.slice(1);
        return firstLetter.toUpperCase() + remaningLetters.toLowerCase();
    }).join(' ');
}
