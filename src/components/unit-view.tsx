import {Spin} from "antd";
import React, {useState} from "react";

import FadeIn from 'react-fade-in';
import {UnitProps} from "./answer";
import {CUSTOM_VIEW, INFO_VIEW, Unit, ViewItem} from "../engine/common";
import {Box, UserAnswer} from "./box";
import {InfoView} from "./info-view";
import {BasicUnit} from "../engine/engine";

export type SetLoaderFn = (loading: boolean) => void;

export interface ViewProps<U extends Unit<U>> extends UnitProps<U> {
    setLoading: SetLoaderFn;
    view: ViewItem<any>;
}

export type ViewFactory<U extends Unit<U>> = React.FunctionComponent<ViewProps<U>>;

interface BasicUnitProps<U extends Unit<U>> extends UnitProps<U> {
    ViewFactoryComponent: ViewFactory<U>;
}

export function PureUnitView<U extends Unit<U>>(props: BasicUnitProps<U>) {
    let [loading, setLoading] = useState(false);
    const {views, choices, actionable} = props.unit;
    const {ViewFactoryComponent} = props;
    console.log(views);

    let result = (
        <Box
            defaultFolded={true}
            defaultActive={!props.isLast && !!actionable}
            toggleable={!!actionable}
            id={props.isLast ? 'latestUnit' : undefined}
        >
            <FadeIn delay={500} transitionDuration={500}>
                {views &&
                    views.map((view, index) =>
                        <ViewFactoryComponent key={index} view={view} {...props} setLoading={setLoading} />
                    )
                }
            </FadeIn>
            {choices && choices.showInHistory && !props.isLast &&
                choices.choices.map((choice, index) => (
                    choices.selectedChoiceIndex === index ?
                        <UserAnswer key={index}>{choice.text}</UserAnswer> : null
                ))
            }
        </Box>
    );
    if (loading) {
        result = <Spin>{result}</Spin>;
    }
    return result;
}

export function DefaultViewFactory({view, ...props}: ViewProps<BasicUnit>) {
    if (view.type === INFO_VIEW) {
        return <InfoView view={view} {...props}/>;
    }
    if (view.type === CUSTOM_VIEW) {
        return <view.payload {...props}/>;
    }
    throw new Error(`Invalid view ${view.type}`);
}


export function BasicUnitView(props: UnitProps<BasicUnit>) {
    return <PureUnitView<BasicUnit> ViewFactoryComponent={DefaultViewFactory} {...props}/>;
}

