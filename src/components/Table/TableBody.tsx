import { FC } from "react";
import styled from "styled-components";
import { ITableBodyProps } from "./Table.types";

const TableBody: FC<ITableBodyProps> = ({
  columns,
  dataSource,
  rowKey = "id",
}) => {
  return (
    <StyledBody>
      {dataSource.map((data, rowIndex) => {
        return (
          <tr className="row" key={data[rowKey] || rowIndex}>
            {columns.map((column) => {
              if (column.renderCell) {
                return (
                  <td className="cell" key={column.name}>
                    {column.renderCell(data[column.name], data, rowIndex)}
                  </td>
                );
              } else {
                return (
                  <td className="cell" key={column.name}>
                    {data[column.name]}
                  </td>
                );
              }
            })}
          </tr>
        );
      })}
    </StyledBody>
  );
};

export default TableBody;

const StyledBody = styled.tbody`
  display: contents;

  .row {
    display: contents;

    &:hover {
      .cell {
        background-color: var(--color-tertiary-light-hover);
      }
    }
  }

  .cell {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--color-border-0);
  }
`;
