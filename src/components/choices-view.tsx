import styled, { keyframes } from "styled-components";
import {Button} from "antd";
import React from "react";
import {ChoicesProps} from "./answer";
import {addSelectedChoice, Unit} from "../engine/common";
import { isEmpty } from "lodash";
import {BasicUnit} from "../engine/engine";

interface OuterDivProps {
    choicesExpanded: boolean;
}

const comeUp = keyframes`
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
`;

const shrinkDown = keyframes`
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(100%);
  }
`;

const OuterDiv = styled.div`
  position: absolute;
  bottom: 0px;
  transform: translateY(${(props: OuterDivProps) => props.choicesExpanded ? "0" : "100%"});
  width: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  color: gray;
  padding: 1em;
  justify-content: space-between;

  animation: ${(props: OuterDivProps) => props.choicesExpanded ? comeUp : shrinkDown} ${(props: OuterDivProps) => props.choicesExpanded ? '0.3s' : '0.1s'} ease-out;
`;

const StyledButton = styled(Button)`
  height: 40px;
  width: auto;
  box-sizing: border-box;
  margin-top: 10px;

  &, &:active, &:hover, &:focus {
    border: none;
  }

  span {
    font-size: 14px;
    font-family: Avenir Next;
    font-style: normal;
    font-weight: 500;
    white-space: normal;
  }
`;

const ChoiceButton = styled(StyledButton)`
  border-radius: 5px;

  &, &:active, &:hover, &:focus {
    background-color: #E7F3F6;
  }

  span {
    color: #399FB2;
  }
`;

export const ContinueButton = styled(StyledButton)`
  border-radius: 25px;

  &, &:active, &:hover, &:focus {
    background-color: #399FB2;
  }

  span {
    color: white;
  }
`;

const SkipButton = styled(StyledButton)`
  &, &:active, &:hover, &:focus {
    background-color: white;
  }

  span {
    color: #399FB2;
  }
`;

export function DefaultChoicesView<U extends Unit<U>>({unit, choicesExpanded, addAction, maxWidth}: ChoicesProps<U>) {
    const {choices} = unit;
    console.log("CP 2", choices);
    if (!choices) {
        return null;
    }

    const cs = choices.choices;
    if (isEmpty(cs)) {
        return null;
    }

    const OuterDivWithMaxWidth = styled(OuterDiv)`
        max-width: ${maxWidth};
    `;

    return (
        <OuterDivWithMaxWidth choicesExpanded={choicesExpanded}>
            { cs.length > 1 ? (
                cs.map(({text, options}, index) => (
                  options && options.exit ? (
                    <SkipButton key={index} onClick={() => addAction(addSelectedChoice(index))}>
                      {text}
                    </SkipButton>) : (
                    <ChoiceButton key={index} onClick={() => addAction(addSelectedChoice(index))}>
                      {text}
                    </ChoiceButton>)
                )))
              : (<ContinueButton onClick={() => addAction(addSelectedChoice(0))}>
                  {(cs[0]).text}
                </ContinueButton>)
            }
        </OuterDivWithMaxWidth>
    )
}

export function BasicChoicesView(props: ChoicesProps<BasicUnit>) {
    return <DefaultChoicesView<BasicUnit> {...props}/>;
}