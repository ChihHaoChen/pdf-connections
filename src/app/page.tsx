"use client";
import styled from "styled-components";
import styles from "./page.module.css";
import { ThreeScene } from "@/components";

export default function Home() {
  return (
    <StyledLayout className={styles.description}>
      <StyledHeader>{"PDF Connections"}</StyledHeader>
      <StyledSection>
        <ThreeScene />
      </StyledSection>
      <StyledSection>
        <input className="input" type="text" id="inputBox" />
      </StyledSection>
    </StyledLayout>
  );
}

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100vw;
  height: 100StyledLayout;
`;

const StyledHeader = styled.div`
  display: block;
  text-align: center;
  justify-self: center;
  width: 100vw;
  height: 80px;
  color: var(--color-primary);
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100vw;
  padding: 16px;
  max-width: var(--width-main);

  .input {
    display: none;
  }
`;
