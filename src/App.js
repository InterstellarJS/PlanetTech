import logo from './logo.svg';
import './App.css';
import React, { useRef, useState, useEffect} from 'react';
import ViewPort    from  './comp/viewPort';
import RightPanel  from  './comp/rightPanel';

function Editor() {
  const [viewportRendered, setViewportRendered] = useState(false);

  useEffect(() => {
    setViewportRendered(true);
  }, []);

  return (
    <div id="MainApp" style={{ position:'absolute', display: 'flex', height: '100%', width:'100%', backgroundColor:'purple' }}>
      <ViewPort />
      <RightPanel />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Editor/>
    </div>
  );
}

export default App;