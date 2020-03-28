import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Action, Unit} from "../engine/common";
import {getEngine} from "../engine/engine";

const Scroll = require('react-scroll');
const scroller = Scroll.scroller;

export type AddActionFn = (action: Action<any>) => void;

const ContentArea = styled.div`
    padding-left: 15px;
    padding-right: 15px;

    margin-bottom: 70vh;
`;

let initState = false;

export interface UnitProps<U extends Unit<U>> {
    unit: U;
    isLast: boolean;
    addAction: AddActionFn;
    maxWidth: string;
}

export type UnitView<U extends Unit<U>> = React.FunctionComponent<UnitProps<U>>;

export interface ChoicesProps<U extends Unit<U>> {
    unit: U;
    choicesExpanded: boolean;
    setChoicesExpanded: (expanded: boolean) => void;
    addAction: AddActionFn;
    maxWidth: string;
}

export type ChoicesView<U extends Unit<U>> = React.FunctionComponent<ChoicesProps<U>>;

interface AnswerProps<U extends Unit<U>> {
    engineName: string;
    className?: string;
    maxWidth?: string;
    initCallback?: (addAction: AddActionFn) => void;
    UnitViewComponent: UnitView<U>;
    ChoicesViewComponent: ChoicesView<U>;

}

export function Answer<U extends Unit<U>>({
    engineName,
    className,
    UnitViewComponent,
    maxWidth,
    initCallback,
    ChoicesViewComponent
}: AnswerProps<U>) {
    const OuterDiv = styled.div`
        margin: 0 auto;
        max-width: ${maxWidth};
        position: relative;
    `;
    const initialUnits: U[] = [];
    let [units, setUnits] = useState(initialUnits);

    console.log("units", units);

    let [choicesExpanded, setChoicesExpanded] = useState(false);

    const addAction = (action: Action<any>) => {
        const engine = getEngine<U>(engineName);
        engine.addAction(action).then(changed => {
            console.log("CP 5", changed);
            if (changed) {
                setUnits(engine.getUnits());
            }
        });
    };

    if (initCallback && units.length === 0) {
        initCallback(addAction);
    }

    const unitsRef: any = useRef(null);

    const onWindowScroll = () => {
        if (!unitsRef.current) { return }
        if (unitsRef.current.clientHeight + unitsRef.current.offsetTop - window.pageYOffset < window.innerHeight * 0.8) {
            setChoicesExpanded(true);
        } else {
            setChoicesExpanded(false);
        }
    }

    useEffect(() => {
        if (!initState) {
            initState = true;
            window.addEventListener("scroll", onWindowScroll);
        }
    });

    useEffect(() => {
        scroller.scrollTo('latestUnit', {
          duration: 400,
          delay: 0,
          smooth: false,
          offset: -100,
        })
    }, [units.length]);

    const realMaxWidth = maxWidth || "100%";

    return (
        <OuterDiv className={className}>
            <ContentArea>
                <div ref={unitsRef} id={`answer_${engineName}`}>
                {
                    units.map((unit, index) => (
                        <UnitViewComponent
                            key={index}
                            unit={unit}
                            addAction={addAction}
                            isLast={index === units.length - 1}
                            maxWidth={realMaxWidth}

                        />))
                }
                </div>
            </ContentArea>

            {units.length > 0 &&
                <ChoicesViewComponent
                    unit={units[units.length - 1]}
                    choicesExpanded={choicesExpanded}
                    setChoicesExpanded={setChoicesExpanded}
                    addAction={addAction}
                    maxWidth={realMaxWidth}
                />
            }

        </OuterDiv>
    );
}
