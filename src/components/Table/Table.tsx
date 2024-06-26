import { useMemo, FC } from "react";
import styled from "styled-components";
import { ITableProps } from "./Table.types";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

const Table: FC<ITableProps> = ({
  columns,
  dataSource,
  rowKey = "id",
  scroll = {},
}) => {
  const tableStyle = useMemo(
    () => ({
      "--count-column": columns.length,
      maxHeight: scroll.y,
      width: scroll.x,
    }),
    [columns, scroll]
  ) as React.CSSProperties;

  return (
    <StyledTable style={tableStyle}>
      <TableHeader columns={columns} />
      <TableBody columns={columns} dataSource={dataSource} rowKey={rowKey} />
    </StyledTable>
  );
};

export default Table;

const StyledTable = styled.table`
  display: grid;
  border-collapse: collapse;
  grid-template-columns: repeat(var(--count-column), auto);
  font-size: var(--font-size-md);
  border-radius: var(--border-radius-sm);
  overflow: auto;
  width: 100%;
`;
