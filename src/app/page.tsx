"use client";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { ThreeScene, Table } from "@/components";
import { pdfData, DataEdge } from "@/data/pdfData";
import styles from "./page.module.css";

export default function Home() {
  const [edge, setEdge] = useState<DataEdge | undefined>(undefined);
  const [edgeValue, setEdgeValue] = useState<string>("");
  const [edgeState, setEdgeState] = useState<DataEdge[]>(pdfData.edges);

  const onChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      setEdgeValue(target.value);
    },
    []
  );

  const onBlur = useCallback(() => {
    setEdgeState((prev) => {
      return prev.map((previousEdge) => {
        if (previousEdge.id === edge?.id) {
          return { ...previousEdge, value: edgeValue };
        }
        return previousEdge;
      });
    });
  }, [edge?.id, edgeValue]);

  const onChangeEdge = useCallback((edge: DataEdge | undefined) => {
    if (edge) {
      setEdge(edge);
      setEdgeValue(edge.value);
    } else {
      setEdge(undefined);
    }
  }, []);

  const columns = [
    {
      name: "id",
      label: "Id",
    },
    {
      name: "source",
      label: "Source",
    },
    {
      name: "target",
      label: "Target",
    },
    {
      name: "value",
      label: "Value",
      renderCell: (_: string) => {
        return (
          <StyledInput value={edgeValue} onChange={onChange} onBlur={onBlur} />
        );
      },
    },
  ];

  const dataSource = [{ ...edge }];

  return (
    <StyledLayout className={styles.description}>
      <StyledHeader>{"PDF Connections"}</StyledHeader>
      <StyledSection>
        <ThreeScene
          pdfNodes={pdfData.nodes}
          pdfEdges={edgeState}
          updateEdge={onChangeEdge}
        />
      </StyledSection>
      <StyledSection>
        {edge && <Table columns={columns} dataSource={dataSource} />}
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
  width: 100%;
  padding: 16px;
  max-width: var(--width-main-section);

  .input {
    display: none;
  }
`;

const StyledInput = styled.input`
  display: flex;
  width: 100%;
  height: 40px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border-1);
  color: var(--color-text-1);
  background-color: var(--color-bg-0);
  cursor: text;
  text-align: end;
  padding: 0 8px;
  color: var(--color-text-1);
  font-size: var(--font-size-lg);
`;
