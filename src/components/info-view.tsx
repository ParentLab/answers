import React from "react";
import {ViewProps} from "./unit-view";
import {INFO_VIEW} from "../engine/common";
const Markdown = require('react-markdown-it');

export function InfoView({view}: ViewProps<any>) {
    if (view.type !== INFO_VIEW) {
        throw new Error(`Wrong view type: expected = INFO_VIEW, was = ${view.type}`);
    }
    return (
        <div id={view.id}>
            <Markdown source={view.payload.info} escapeHtml={false}/>
        </div>
    );
}