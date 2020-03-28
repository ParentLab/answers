import * as React from 'react';
import {DecisionTree} from "../algorithms/decision-tree";
import {Answer} from "./answer";
import {BasicUnitView} from "./unit-view";
import 'antd/dist/antd.css';
import {BasicChoicesView} from "./choices-view";
import styled from "styled-components";
import { InputNumber, Select } from 'antd';
const {Option} = Select;

export default { title: 'Answers' };

const CustomAnswer = styled(Answer)`
  height: 80vh;
`;

enum FilingStatus {
    Single = "Single",
    Married = "Married",
    HeadOfHousehold = "Head of household"
}

export const decisionTree = () => {
    const engineName = "decision_tree";

    let taxYear = 2019;
    let filingStatus = FilingStatus.Single;
    let grossingIncome = 0;
    let numOfChild = 0;
    let done = false;

    return (
        <CustomAnswer
            engineName={engineName}
            maxWidth={"800px"}
            UnitViewComponent={BasicUnitView}
            ChoicesViewComponent={BasicChoicesView}
            initCallback={(addAction) => {
                DecisionTree(engineName, {
                    rootId: "I1",
                    mapping: {
                        "I1": {
                            id: "I1",
                            info: "Have you filed your 2019 taxes yet?",
                            choices: [
                                {
                                    choice: "Yes",
                                    nextId: "I2"
                                },
                                {
                                    choice: "No",
                                    nextId: async () => {
                                        taxYear = 2018;
                                        return "I2";
                                    }
                                }
                            ]
                        },
                        "I2": {
                            id: "I2",
                            info: async () => `What was your filing status in your ${taxYear} taxes?`,
                            choices: [
                                {
                                    choice: FilingStatus.Single,
                                    nextId: "I3",
                                },
                                {
                                    choice: FilingStatus.Married,
                                    nextId: async () => {
                                        filingStatus = FilingStatus.Married;
                                        return "I3";
                                    }
                                },
                                {
                                    choice: FilingStatus.HeadOfHousehold,
                                    nextId: async () => {
                                        filingStatus = FilingStatus.HeadOfHousehold;
                                        return "I3";
                                    }
                                }
                            ]
                        },
                        "I3": {
                            id: "I3",
                            custom: {
                                component: (_props) => {
                                    return (
                                        <React.Fragment>
                                            <p>What was your adjusted gross income in {taxYear}?</p>
                                            <InputNumber
                                                disabled={done}
                                                defaultValue={grossingIncome}
                                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => !value ? '' : value.replace(/\$\s?|(,*)/g, '')}
                                                onChange={value => {
                                                    grossingIncome = value || 0;
                                                }}
                                            />
                                        </React.Fragment>
                                    );
                                }
                            },
                            choices: [
                                {
                                    choice: "Continue",
                                    nextId: "I4",
                                }
                            ]
                        },
                        "I4": {
                            id: "I4",
                            custom: {
                                component: (_props) => {
                                    return (
                                        <React.Fragment>
                                            <p>How many children did you claim as dependents in {taxYear}?</p>
                                            <Select disabled={done} defaultValue={`${numOfChild}`} style={{ width: 120 }} onChange={(value) => {
                                                numOfChild = parseInt(value);
                                            }}>
                                                <Option value="0">0</Option>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="3">3</Option>
                                                <Option value="4">4</Option>
                                                <Option value="5">5</Option>
                                                <Option value="6">6</Option>
                                                <Option value="7">7</Option>
                                                <Option value="8">8</Option>
                                                <Option value="9">9</Option>
                                            </Select>
                                        </React.Fragment>
                                    );
                                }
                            },
                            choices: [
                                {
                                    choice: "Continue",
                                    nextId: async () => {
                                        done = true;
                                        return "I5";
                                    },
                                }
                            ]
                        },
                        "I5": {
                            id: "I5",
                            info: async () => {
                                let base = 75000;
                                if (filingStatus === FilingStatus.Married) {
                                    base = 150000;
                                } else if (filingStatus === FilingStatus.HeadOfHousehold) {
                                    base = 112500;
                                }

                                let value = filingStatus === FilingStatus.Married ? 2400 : 1200;
                                value += 500 * numOfChild;

                                value = Math.ceil(value - (grossingIncome - base) * 0.05);
                                if (value <= 0) {
                                    return 'Your income was likely too high to receive any stimulus payment.';
                                }
                                return `You are likely getting a ${`$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} stimulus payment.`
                            }
                        }
                    }
                }, addAction);
            }}
        />
    );
};