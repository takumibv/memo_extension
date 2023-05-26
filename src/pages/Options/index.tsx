import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch, Redirect } from "react-router";
import Options from "./Options";

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById("root")
);
