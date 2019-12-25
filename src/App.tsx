import React from 'react';
import './App.css';
import { DraggableTable, createColumn, makeRow } from './Table';

const App: React.FC = () => {
  var a = 4;
  if (a === 2) {

  }
  return (
    <div className="App">
      <DraggableTable
        columns={[
          createColumn(0, 'personId', 'Person ID'),
          createColumn(1, 'name', 'Name'),
          createColumn(2, 'age', 'Age'),
        ]}
        rows={[
          makeRow(0, { personId: 123, name: 'Andrew Varnerin', age: 27 }),
          makeRow(1, { personId: 234, name: 'Sterling Archer', age: 40 }),
          makeRow(2, { personId: 345, name: 'Albus Dumbledore', age: 112 })
        ]}
      />
    </div>
  );
}

export default App;
