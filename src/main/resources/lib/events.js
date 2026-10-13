/*global app*/

const adminLib = require('/lib/xp/admin');
const eventLib = require('/lib/xp/event');

const MODEL_CHANGED = 'modelChanged';

const MODEL_REPO = 'system.app';

exports.MODEL_CHANGED_TOPIC = `${app.name}:${MODEL_CHANGED}`;

function toTopicNode(node) {
    const result = {
        id: node.id,
        path: node.path,
        branch: node.branch,
        repo: node.repo
    };
    if (node.newPath) {
        result.newPath = node.newPath;
    }
    return result;
}

exports.init = function init() {
    adminLib.setTopic({
        name: MODEL_CHANGED,
        allow: ['role:system.admin', 'role:system.user.admin', 'role:system.user.app']
    });

    eventLib.listener({
        type: 'node.*',
        localOnly: false,
        callback: function (event) {
            const nodes = (event.data && event.data.nodes) || [];
            const modelNodes = nodes.filter(node => node.repo === MODEL_REPO);
            if (modelNodes.length === 0) {
                return;
            }
            adminLib.sendToTopic(MODEL_CHANGED, {
                type: event.type,
                data: {
                    nodes: modelNodes.map(toTopicNode)
                }
            });
        }
    });
};
