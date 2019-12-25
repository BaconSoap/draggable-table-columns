import React from "react"

export type ColumnConfiguration = {
  id: string;
  order: number;
  title: string;
  isDragging: boolean;
}

export const createColumn = (order: number, id: string, title: string): ColumnConfiguration => ({
  id,
  order,
  title,
  isDragging: false
});

type DataMap = {
  [id: string]: any;
};

export type RowData = {
  id: number;
  data: DataMap;
}

export const makeRow = (id: number, data: DataMap): RowData => ({ id, data });

export type DraggableTableOwnProps = {
  columns: ColumnConfiguration[];
  rows: RowData[];
}

export class DraggableTable extends React.PureComponent<DraggableTableOwnProps> {

  public render() {
    const { columns, rows } = this.props;

    const orderedColumns = [...columns].sort(x => x.order);

    return (
      <table>
        <thead>
          <tr>
            {orderedColumns.map(c => (
              <th key={c.id}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <Row key={r.id} row={r} columns={orderedColumns} />
          ))}
        </tbody>
      </table>
    )
  }
}

export const Row = (props: { row: RowData, columns: ColumnConfiguration[] }) => (
  <tr key={props.row.id}>
    {props.columns.map(c => (
      <td key={c.id}>
        {props.row.data[c.id]}
      </td>
    ))}
  </tr>
);