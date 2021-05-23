import React, { useEffect, useRef, useCallback } from 'react';
import {Route, Switch, HashRouter} from "react-router-dom"
import {default as Timer} from './Components/Timer/Timer'
import {default as Welcome} from './Components/Welcome'
// TODO: 
// - Pagina de ayuda con instrucciones (el inicio? timer/)
// - Cambio de colores
// - Cambio de direccion de progreso
// - Notificacion

function App() {


  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={Timer} />
        <Route exact path="/:time" component={Timer} />
      </Switch>
    </HashRouter>
  );
}

export default App;
