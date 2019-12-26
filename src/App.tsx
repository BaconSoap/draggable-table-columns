import React from 'react';
import './App.css';
import { DraggableTable, createColumn, makeRow, ColumnConfiguration, IdToOrder } from './Table';

type AppState = { columns: ColumnConfiguration[] };
class App extends React.PureComponent<{}, AppState> {

  public state: AppState = {
    columns: [
      createColumn(0, 'personId', 'Person ID'),
      createColumn(1, 'name', 'Name'),
      createColumn(2, 'age', 'Age'),
    ]
  };

  private onColumnsReordered = (idsToOrder: IdToOrder) => {
    const newColumns = this.state.columns.map(c => ({
      ...c,
      order: idsToOrder[c.id]
    }));
    newColumns.sort((first, second) => first.order - second.order);
    this.setState({ columns: newColumns });
    console.log(newColumns);
  }

  public render() {
    var a = 4;
    if (a === 2) {

    }
    return (
      <div className="App">
        <DraggableTable
          columns={this.state.columns}
          onColumnsReordered={this.onColumnsReordered}
          rows={[
            makeRow(0, { personId: 123, name: 'Andrew Varnerin', age: 27 }),
            makeRow(1, { personId: 234, name: 'Sterling Archer', age: 40 }),
            makeRow(2, { personId: 345, name: 'Albus Dumbledore', age: 112 })
          ]}
        />
      </div>
    );
  }
}

export default App;
