"use client";
import styled from "styled-components";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.description}>
      <StyledHeader>{"Testing Boilerplate"}</StyledHeader>
    </div>
  );
}

const StyledHeader = styled.h1`
  color: teal;
`;
