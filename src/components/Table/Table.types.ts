export type RecordType = AnyLiteral;

export interface Column {
  name: string;
  label: React.ReactNode;
  renderCell?: (
    text: AnyValue,
    record: RecordType,
    index: number
  ) => React.ReactNode;
}

export interface Scroll {
  x?: number | string;
  y?: number | string;
}

export interface ITableProps {
  columns: Array<Column>;
  dataSource: Array<RecordType>;
  className?: string;
  rowKey?: string;
  scroll?: Scroll;
}

export interface ITableHeaderProps {
  columns: Array<Column>;
}

export type ITableBodyProps = ITableProps;
