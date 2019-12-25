import React from "react"
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

    const extraProps = {
      renderClone: (provided: any, snapshot: any, rubric: any) => (
        createPortal(<div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          Blargh
        </div>, document.body
        )
      )
    };
    return (
      <table>
        <thead>
          <DragDropContext onDragEnd={console.log}>
            <Droppable droppableId='headers' direction='horizontal' {...extraProps}>
              {(provided, snapshot) => (
                <tr ref={provided.innerRef}>
                  {orderedColumns.map(c => (
                    <Draggable index={c.order} draggableId={c.id} key={c.id}>
                      {(colProvided, colSnapshot) => (
                        <th ref={colProvided.innerRef} {...colProvided.draggableProps} {...colProvided.dragHandleProps}>{c.title}</th>
                      )}
                    </Draggable>
                  ))}
                </tr>
              )}
            </Droppable>
          </DragDropContext>
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