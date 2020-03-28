export interface Action<P> {
    id?: number;
    type: string;
    payload: P;
}

export interface ViewItem<P> {
    id?: string;
    type: string;
    payload: P;
}

export const ADD_SELECTED_CHOICE = "ADD_SELECTED_CHOICE";
export interface ChoiceActionPayload {
    selectedChoiceIndex: number;
}

export const INFO_VIEW = "INFO_VIEW";
export interface InfoViewPayload {
    info: string;
}

export const CUSTOM_VIEW = "CUSTOM_VIEW";

export function addSelectedChoice(
    selectedChoiceIndex: number,
): Action<ChoiceActionPayload> {
    return {
        type: ADD_SELECTED_CHOICE,
        payload: {
            selectedChoiceIndex
        },
    };
}

export type ActionHandler<U extends Unit<U>> = (action: Action<any>) => Promise<U | null>;
export type ChoiceCallback<U extends Unit<U>> = (index: number) => Promise<U | null>;

export interface ChoiceItem<U extends Unit<U>> {
    text: string;
    options?: any;
    callback: ChoiceCallback<U>;
}

export interface Choices<U extends Unit<U>> {
    choices: ChoiceItem<U>[];
    showInHistory?: boolean;
    selectedChoiceIndex?: number;
}

export function nextChoices<U extends Unit<U>>(choice: ChoiceItem<U>): Choices<U> {
    return {
        showInHistory: false,
        choices: [choice]
    };
}

export interface Unit<U extends Unit<U>> {
    // will be managed by Engine
    actionId?: number;
    isCompleted?: boolean;

    views: ViewItem<any>[];
    choices?: Choices<U>;
    actionHandler?: ActionHandler<U>;

    actionable?: boolean;
}

export interface IEngine<U extends Unit<U>> {
    getLastUnit(): U | null;
    getCurrentActionId(): number;
    getAllActions(): Action<any>[];
    addAction(action: Action<any>): Promise<boolean>;
    getUnits(): U[];
}