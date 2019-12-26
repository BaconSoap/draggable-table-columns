import React from "react"
import { createPortal } from "react-dom";

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
  onColumnsReordered: (newIdsAndOrders: IdToOrder) => void;
}

export type IdToOrder = { [id: string]: number; };

type DraggableTableState = {
  dragColumnId: string | null;
  initialXPosition: number | null;
  xPosition: number | null;
  xOffset: number | null,
  yPosition: number | null;
  width: number | null;
  allBoundingRects: DOMRect[] | null,
  hasPassedThreshold: boolean,
}

export class DraggableTable extends React.PureComponent<DraggableTableOwnProps, DraggableTableState> {

  public state: DraggableTableState = {
    dragColumnId: null,
    initialXPosition: null,
    xPosition: null,
    xOffset: null,
    yPosition: null,
    width: null,
    allBoundingRects: null,
    hasPassedThreshold: false,
  }

  private dragColumnRef: React.Ref<HTMLTableHeaderCellElement> = React.createRef();

  public handleHeaderCellMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const realTarget = e.target as HTMLElement;

    // make sure we're actually working with a TH element
    if (realTarget.nodeName !== 'TH') {
      return;
    }

    const boundingRect = realTarget.getBoundingClientRect();

    // get a snapshot of values for dragging
    const allBoundingRects = Array.from(realTarget.parentElement!.children).map(e => e.getBoundingClientRect());
    const initialXPosition = e.pageX;
    const xPosition = e.pageX;
    const xOffset = e.pageX - boundingRect.left;
    const yPosition = boundingRect.top;
    const width = boundingRect.width;
    const dragColumnId = realTarget.dataset.columnId!;

    this.setState({
      dragColumnId,
      initialXPosition,
      xPosition,
      xOffset,
      yPosition,
      width,
      allBoundingRects,
      hasPassedThreshold: false,
    });
  }

  public handleMouseMove = (e: MouseEvent) => {
    if (!this.state.dragColumnId) {
      return;
    }
    let hasPassedThreshold = this.state.hasPassedThreshold;
    if (!hasPassedThreshold) {
      hasPassedThreshold = Math.abs(e.pageX - this.state.initialXPosition!) > 10;
    }

    this.setState({ xPosition: e.pageX, hasPassedThreshold });
  }

  public handleHeaderCellMouseUp = (e: MouseEvent) => {
    if (!this.state.dragColumnId) {
      return;
    }

    // if we've passed the threshold to start dragging, compute final
    // column positions here
    if (this.state.hasPassedThreshold) {
      this.computeNewPositions();
    }

    this.setState({
      dragColumnId: null,
      initialXPosition: null,
      xPosition: null,
      xOffset: null,
      yPosition: null,
      width: null,
      allBoundingRects: null,
      hasPassedThreshold: false,
    });
  }

  private computeNewPositions = () => {
    // figure out where the new field goes
    let newIndex = 0;
    const xPosition = this.state.xPosition!;
    const boundingRects = this.state.allBoundingRects!;

    for (let i = 0; i < boundingRects.length; i++) {
      const isLast = i === boundingRects.length - 1;
      const r = boundingRects[i];
      const isWithinCurrentCell = (r.left <= xPosition && xPosition < r.right);

      // this can only be true if it's dropped to the left of the table
      const isLeftOfCurrentCell = (r.left > xPosition);
      if (isWithinCurrentCell || isLeftOfCurrentCell || isLast) {
        newIndex = i;
        break;
      }
    }

    // move the column in the array and compute new order values
    const sortedColumns = [...this.props.columns].map(sc => ({ ...sc })).sort((first, second) => first.order - second.order);
    const fromIndex = sortedColumns.findIndex(x => x.id === this.state.dragColumnId)!;
    const el = sortedColumns[fromIndex];
    sortedColumns.splice(fromIndex, 1);
    sortedColumns.splice(newIndex, 0, el);

    let idsToOrder: any = {};
    sortedColumns.forEach((sc, idx) => sc.order = idx);
    sortedColumns.forEach(sc => idsToOrder[sc.id] = sc.order);
    this.props.onColumnsReordered(idsToOrder);
  }

  public componentDidMount() {
    // these are bound outside of the header row to ensure that dragging
    // around isn't a weird experience - otherwise the events would only fire
    // when the mouse is within the header row
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleHeaderCellMouseUp)
  }

  public componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleHeaderCellMouseUp);
  }

  public render() {
    const { columns, rows } = this.props;

    const orderedColumns = [...columns].sort((first, second) => first.order - second.order);
    let headerColumns = [...orderedColumns];

    // if we're currently dragging a header, find and clone that column configuration
    // as a new object with the drag field set. HeaderCell will render this differently
    if (this.state.dragColumnId && this.state.hasPassedThreshold) {
      const dragHeaderCell = orderedColumns.find(h => h.id === this.state.dragColumnId)!;
      const clonedCell: ColumnConfiguration = { ...dragHeaderCell, isDragging: true };
      const index = headerColumns.findIndex(h => h.id === this.state.dragColumnId);
      headerColumns.splice(index, 0, clonedCell);
    }

    return (
      <>
        <table>
          <thead>
            <tr
              onMouseDown={this.handleHeaderCellMouseDown}
            >
              {headerColumns.map(c => (
                <HeaderCell
                  column={c}
                  key={(c.isDragging ? c.id + '_drag' : c.id)}
                  ref={this.dragColumnRef}
                  xPosition={this.state.xPosition}
                  xOffset={this.state.xOffset}
                  yPosition={this.state.yPosition}
                  width={this.state.width}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <Row key={r.id} row={r} columns={orderedColumns} />
            ))}
          </tbody>
        </table>

        <h3>Debug</h3>
        <table>
          <tbody>
            <tr>
              <td>dragColumnId</td>
              <td>{this.state.dragColumnId}</td>
            </tr>
            <tr>
              <td>initialXPosition</td>
              <td>{this.state.initialXPosition}</td>
            </tr>
            <tr>
              <td>xPosition</td>
              <td>{this.state.xPosition}</td>
            </tr>
            <tr>
              <td>xOffset</td>
              <td>{this.state.xOffset}</td>
            </tr>
            <tr>
              <td>yPosition</td>
              <td>{this.state.yPosition}</td>
            </tr>
            <tr>
              <td>width</td>
              <td>{this.state.width}</td>
            </tr>
            <tr>
              <td>hasPassedThreshold</td>
              <td>{this.state.hasPassedThreshold + ''}</td>
            </tr>
          </tbody>
        </table>

        <table id='target'><thead><tr></tr></thead></table>
      </>
    )
  }
}

type HeaderCellProps = {
  column: ColumnConfiguration;
  xPosition: number | null;
  xOffset: number | null;
  yPosition: number | null;
  width: number | null;
};

export const HeaderCell = React.forwardRef((props: HeaderCellProps, ref: React.Ref<HTMLTableHeaderCellElement>) => {
  const { column, xPosition, yPosition, xOffset, width } = props;

  // if this is the draggable placeholder column, render it outside the table
  // and sticky to the mouse's x position
  if (column.isDragging) {
    const left = xPosition! - xOffset!;
    const headerCellStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 5,
      left,
      top: yPosition!,
      display: 'block',
      pointerEvents: 'none',
      width: width!
    };

    // portal the element to a special holding table that exists to retain styles/behavior.
    // this prevents the table header row from shifting everything
    return createPortal((<th
      key={column.id}
      data-column-id={column.id}
      ref={ref}
      style={headerCellStyle}
      className='dragging'
    >
      {column.title}
    </th>
    ), document.querySelector('#target thead tr')!);
  }

  // normal header cells render here
  return (<th
    key={column.id}
    data-column-id={column.id}
  >
    {column.title}
  </th>
  );
});

export const Row = (props: { row: RowData, columns: ColumnConfiguration[] }) => (
  <tr key={props.row.id}>
    {props.columns.map(c => (
      <td key={c.id}>
        {props.row.data[c.id]}
      </td>
    ))}
  </tr>
);