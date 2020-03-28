import React, {useEffect, useState} from "react";
import styled from "styled-components";

const Scroll = require('react-scroll');
const Element = Scroll.Element;

const Container = styled.div`
  border: 1px solid #88C4D1;
  margin: 20px 0 20px;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 15px 25px 30px;

  &.inactive {
    border: 1px solid rgba(220, 220, 220, 0.6);
  }
`;

const MainContainer = styled(Container)`
  &.unfolded.active {
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .source-line {
    display: none;
  }

  &.active.unfolded .source-line {
    display: block;
  }

`;

const BoxContainer = styled.div`
  margin-bottom: 0;
  &.folded.actionable, &.inactive.actionable {
    margin-bottom: -40px;
  }
`;

export const UserAnswer = styled.p`
    margin-top: 20px;
    font-weight: 500;
    color: #5F5F5F;
`;

const UnboxedContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;

  p {
    padding-left: 10px;
    padding-right: 10px;
  }

  ${UserAnswer} {
    padding-left: 20vw;
    padding-right: 0;
    text-align: right;
  }
`;

const ActionButton = styled.div`
  width: 10vw;
  max-width: 50px;
  height: 14vw;
  max-height: 50px;
  text-align: center;
  color: #808080;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  img {
    width: 7vw;
    max-width: 30px;
    height: 7vw;
    max-height: 30px;
    padding-bottom: 8px;
  }
`;


const Toggler = styled.div`
  width: 50px;
  height: 25px;
  transform: translateY(-45px) rotate(0deg);
  margin-left: calc(50% - 27px);
  display: flex;
  justify-content: center;
  transition: transform 0.2s;

  img {
    width: 15px;
  }

  &.active {
    opacity: 1;
  }

  &.inactive {
    opacity: 0;
  }

  &.folded {
    transform: translateY(-45px) rotate(360deg);
  }

  &.unfolded {
    transform: translateY(-45px) rotate(180deg);
  }

  &:hover {

  }
`;


const ActionContainer = styled(Container)`
  margin-top: -66px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 40px 4vw 8px 4vw;
  margin-bottom: 0;
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  overflow: hidden;
  
  &.folded, &.inactive {
    display: none;
  }
`;

interface BoxProps {
    id?: string;
    defaultActive: boolean;
    defaultFolded: boolean;
    toggleable: boolean;
    children: any
}

export const Box = ({id, defaultActive, defaultFolded, toggleable, children}: BoxProps) => {
    const [active, setActive] = useState(defaultActive)
    const [folded, setFolded] = useState(defaultFolded)
    const [className, setClassName] = useState("")

    const updateClassName = () => {
        let className = [
            (active && !folded) ? "unfolded" : "folded",
            active ? "active" : "inactive",
            toggleable ? "actionable" : "unactionable",
        ].join(" ");
        setClassName(className);
    }

    useEffect(() => {
        setActive(defaultActive);
        updateClassName();
    }, [defaultActive]);

    useEffect(() => {
        setFolded(defaultFolded);
        updateClassName();
    }, [defaultFolded]);

    useEffect(() => {
        updateClassName();
    }, [active, folded]);

    return (
        <Element name={id ? id : ''}>
            { toggleable ?
                <BoxContainer className={className}>
                    <MainContainer className={className} onClick={toggleable ? () => setActive(!active) : undefined}>
                        {children}
                    </MainContainer>
                    <Toggler
                        onClick={toggleable ? (e) => {e.preventDefault(); setFolded(!folded)} : undefined }
                        className={className}>
                        <img src="/toggle.svg"/>
                    </Toggler>
                    <ActionContainer className={className}>
                        <ActionButton onClick={undefined}>
                            <img src="/btn-like.svg" />
                            <p>999</p>
                        </ActionButton>
                        <ActionButton onClick={undefined}>
                            <img src="/btn-save.svg" />
                            <p>999</p>
                        </ActionButton>
                        <ActionButton onClick={undefined}>
                            <img src="/btn-comment.svg" />
                            <p>999</p>
                        </ActionButton>
                        <ActionButton onClick={undefined}>
                            <img src="/btn-ref.svg" />
                            <p>Reference</p>
                        </ActionButton>
                        <ActionButton onClick={undefined}>
                            <img src="/btn-share.svg" />
                            <p>Share</p>
                        </ActionButton>
                    </ActionContainer>
                </BoxContainer>
                :
                <UnboxedContainer>
                    {children}
                </UnboxedContainer>
            }
        </Element>
    )
};