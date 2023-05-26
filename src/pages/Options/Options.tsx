import React from "react";
import { Route, Switch, Redirect } from "react-router";
import Memos from "./Memos";
import Setting from "./Setting";
import { AuthProvider } from "../../hooks/useFirebaseAuth";

interface Props {}

const Options: React.FC<Props> = () => {
  return (
    <>
      <AuthProvider>
        <Switch>
          <Route exact path="/memos.html" component={Memos} />
          <Route exact path="/setting.html" component={Setting} />
          <Route path="*" component={() => <Redirect to="/memos.html" />} />
        </Switch>
      </AuthProvider>
    </>
  );
};

export default Options;
