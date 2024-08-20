import React from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { Route, Switch, Redirect } from "react-router";
import Options from "./Options";
import Setting from "./Setting";

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <React.StrictMode>
        <Switch>
          {/* <Route path="*" component={() => <NavLink to="/options.html/blocksites">a</NavLink>} /> */}
          <Route exact path="/memos.html" component={Options} />
          <Route exact path="/setting.html" component={Setting} />
          <Route path="*" component={() => <Redirect to="/memos.html" />} />
        </Switch>
      </React.StrictMode>
    </BrowserRouter>
  );
}
