import {Action, ActionHandler, ADD_SELECTED_CHOICE, ChoiceActionPayload, IEngine, Unit} from "./common";

export interface BasicUnit extends Unit<BasicUnit> {
}

export class Engine<U extends Unit<U>> implements IEngine<U> {
    nextActionId: number;
    actions: Action<any>[];
    units: U[];
    lastUnit: U | null;
    initActionHandler: ActionHandler<U>;

    constructor(initActionHandler: ActionHandler<U>) {
        this.nextActionId = 1;
        this.actions = [];
        this.units = [];
        this.lastUnit = null;
        this.initActionHandler = initActionHandler;
    }

    async addAction(action: Action<any>): Promise<boolean> {
        action.id = this.nextActionId++;
        this.actions.push(action);

        let nextUnit;
        if (action.type == ADD_SELECTED_CHOICE) {
            if (this.lastUnit === null) {
                throw new Error("Illegal State!");
            }
            const choices = this.lastUnit.choices;
            if (!choices) {
                throw new Error("Illegal State!");
            }
            console.log("CP 3", action, choices);
            const payload = action.payload as ChoiceActionPayload;
            const choiceItem = choices.choices[payload.selectedChoiceIndex];
            choices.selectedChoiceIndex = payload.selectedChoiceIndex;
            nextUnit = await choiceItem.callback(payload.selectedChoiceIndex);
        } else {
            const handler = this.lastUnit ? this.lastUnit.actionHandler : this.initActionHandler;
            if (!handler) {
                throw new Error("The actionHandler was not set for last unit");
            }
            nextUnit = await handler(action);
        }
        if (nextUnit) {
            console.log("CP 4", nextUnit);
            nextUnit.actionId = action.id;
            if (this.lastUnit) {
                this.lastUnit.isCompleted = true;
            }
            this.lastUnit = nextUnit;
            this.units.push(nextUnit);
            return true;
        }
        return false;
    }

    getAllActions(): Action<any>[] {
        return [];
    }

    getCurrentActionId(): number {
        return this.nextActionId - 1;
    }

    getLastUnit(): U | null{
        return this.lastUnit;
    }

    getUnits(): U[] {
        return [...this.units];
    }
}

export function initEngine<U extends Unit<U>>(name: string, initActionHandler: ActionHandler<U>): IEngine<U> {
    const isServer = typeof window === 'undefined';
    if (isServer) {
        throw new Error("Should not use in server side");
    }
    const key = `_engine_${name}`;
    if (key in window) {
        console.warn(`The engine with name ${name} exists, going to replace it`);
    }
    return window[key] = new Engine<U>(initActionHandler);
}

export function getEngine<U extends Unit<U>>(name: string): IEngine<U> {
    const isServer = typeof window === 'undefined';
    if (isServer) {
        throw new Error("Should not use in server side");
    }
    const key = `_engine_${name}`;
    if (!(key in window)) {
        throw new Error("The engine was not initialized");
    }
    return window[key];
}

export function initBasicEngine(name: string, initActionHandler: ActionHandler<BasicUnit>): IEngine<BasicUnit> {
    return initEngine<BasicUnit>(name, initActionHandler);
}

export function getBasicEngine(name: string): IEngine<BasicUnit> {
    return getEngine<BasicUnit>(name);
}