import React from "react";
import {Action, ActionHandler, CUSTOM_VIEW, INFO_VIEW} from "../engine/common";
import {BasicUnit, initEngine} from "../engine/engine";
import {AddActionFn} from "../components/answer";
import {ViewProps} from "../components/unit-view";

type ContentCallback = () => Promise<string>;
type StringOrCallback = string | ContentCallback;

export interface Node {
    id: string;
    info?: StringOrCallback;
    custom?: {
        component: React.FunctionComponent<ViewProps<BasicUnit>>,
        actionHandler?: ActionHandler<BasicUnit>
    };
    choices?: {choice: StringOrCallback, nextId: StringOrCallback}[];
}

export interface NoCircularGraph {
    rootId: string;
    mapping: Record<string, Node>;
}

const ADD_TREE_DATA = "ADD_TREE_DATA";

async function getContent(content: StringOrCallback) {
    if (typeof (content) === 'string') {
        return content;
    }
    return await content();
}

export const DecisionTree = (engineName: string, data: NoCircularGraph, addAction: AddActionFn) => {
    initEngine<BasicUnit>(engineName, async (action: Action<NoCircularGraph>) => {
        const payload: NoCircularGraph = action.payload;
        const getUnit = async (currentNodeId: string): Promise<BasicUnit> => {
            const node = payload.mapping[currentNodeId];
            if (!node) {
                throw new Error(`The tree data is invalid, the node with id ${currentNodeId} doesn't exist`);
            }

            const choices = await Promise.all(
                (node.choices || []).map(async choice => {
                    const text = await getContent(choice.choice);
                    return {
                        text,
                        callback: async () => {
                            const nextId = await getContent(choice.nextId);
                            return getUnit(nextId);
                        }
                    };
                })
            );

            const view = node.info ? {
                type: INFO_VIEW,
                payload: {
                    info: await getContent(node.info)
                }
            } : {
                type: CUSTOM_VIEW,
                payload: node.custom?.component
            };

            return {
                views: [view],
                choices: {
                    choices,
                    showInHistory: true,
                },
                actionHandler: node.custom ? node.custom.actionHandler : undefined
            };
        };

        return getUnit(payload.rootId);
    });

    addAction({
        type: ADD_TREE_DATA,
        payload: data
    });
};