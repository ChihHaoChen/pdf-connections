"use client";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { ThreeScene, Table, Header, Loading } from "@/components";
import { pdfData, DataEdge } from "@/data/pdfData";
import { EmptyIcon } from "@/assets/icons";

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
      setEdgeValue("");
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
    <StyledLayout>
      <Header title={"PDF Graph Viewer"} />
      <StyledSection>
        <ThreeScene
          pdfNodes={pdfData.nodes}
          pdfEdges={edgeState}
          updateEdge={onChangeEdge}
        />
      </StyledSection>
      <StyledSection>
        <h1 className="sectionTitle">{"Edges for Editing"}</h1>
        {edge ? (
          <Table columns={columns} dataSource={dataSource} />
        ) : (
          <StyledEmptyIcon>
            <EmptyIcon className="icon" />
          </StyledEmptyIcon>
        )}
      </StyledSection>
    </StyledLayout>
  );
}

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  padding: 16px;
  max-width: var(--width-main-section);

  .input {
    display: none;
  }

  .sectionTitle {
    margin: 0 0 16px 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-1);
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

const StyledEmptyIcon = styled.div`
  display: grid;
  place-items: center;
  margin: 32px 0;
  width: 100%;

  .icon {
    width: 128px;
  }
`;
