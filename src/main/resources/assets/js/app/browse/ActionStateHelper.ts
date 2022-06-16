import {ActionState} from './ActionState';
import {ModelAction} from './ModelAction';

export class ActionStateHelper {
    static getStateForMultiSelect(): ActionState[] {
        const result: ActionState[] = [];

        result.push({key: ModelAction.NEW, enabled: false});
        result.push({key: ModelAction.EDIT, enabled: false});
        result.push({key: ModelAction.DELETE, enabled: false});

        return result;
    }

    static getStateNoSelection(): ActionState[] {
        const result: ActionState[] = [];

        result.push({key: ModelAction.NEW, enabled: true});
        result.push({key: ModelAction.EDIT, enabled: false});
        result.push({key: ModelAction.DELETE, enabled: false});

        return result;
    }

    static getStateForComponentAndSchema(): ActionState[] {
        const result: ActionState[] = [];

        result.push({key: ModelAction.NEW, enabled: false});
        result.push({key: ModelAction.EDIT, enabled: true});
        result.push({key: ModelAction.DELETE, enabled: true});

        return result;
    }

    static getStateForComponentAndSchemaFolders(): ActionState[] {
        const result: ActionState[] = [];

        result.push({key: ModelAction.NEW, enabled: true});
        result.push({key: ModelAction.EDIT, enabled: false});
        result.push({key: ModelAction.DELETE, enabled: false});

        return result;
    }

    static getStateForApplication(): ActionState[] {
        const result: ActionState[] = [];

        result.push({key: ModelAction.NEW, enabled: false});
        result.push({key: ModelAction.EDIT, enabled: false});
        result.push({key: ModelAction.DELETE, enabled: true});

        return result;
    }
}