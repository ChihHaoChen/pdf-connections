import { FC } from "react";
import styled from "styled-components";
import { ITableHeaderProps } from "./Table.types";

const TableHeader: FC<ITableHeaderProps> = ({ columns }) => {
  return (
    <StyledTHead>
      <tr className="row">
        {columns.map(({ name, label }) => {
          return (
            <th className="cell" key={name}>
              {label}
            </th>
          );
        })}
      </tr>
    </StyledTHead>
  );
};

export default TableHeader;

const StyledTHead = styled.thead`
  display: contents;

  .row {
    display: contents;
  }

  .cell {
    position: sticky;
    top: 0;
    padding: 12px;
    text-align: left;
    background-color: var(--color-bg-2);
  }
`;
