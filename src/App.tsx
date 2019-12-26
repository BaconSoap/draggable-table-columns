import React from 'react';
import './App.css';
import { DraggableTable, createColumn, makeRow, ColumnConfiguration, IdToOrder } from './Table';
import { sortBy } from './helpers';

type AppState = { columns: ColumnConfiguration[] };
class App extends React.PureComponent<{}, AppState> {

  public state: AppState = {
    columns: [
      createColumn(0, 'personId', 'Person ID'),
      createColumn(1, 'name', 'Name'),
      createColumn(2, 'age', 'Age'),
    ]
  };

  // when the table columns are reordered apply to the master list of columns
  // in a real app this would likely be redux
  private onColumnsReordered = (idsToOrder: IdToOrder) => {
    let newColumns = this.state.columns.map(c => ({
      ...c,
      order: idsToOrder[c.id]
    }));

    newColumns = sortBy(newColumns, c => c.order);

    this.setState({ columns: newColumns });
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
