import React, { useEffect, useRef, useCallback } from 'react';
import {Route, Switch, HashRouter} from "react-router-dom"
import {default as Timer} from './Components/Timer'
import {default as Welcome} from './Components/Welcome'
function App() {


  return (
    <HashRouter>
      <Switch>
        <Route exact path="/:time" component={Timer} />
      </Switch>
    </HashRouter>
  );
}

export default App;
