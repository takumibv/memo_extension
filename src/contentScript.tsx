import React from "react";
import ReactDOM from "react-dom";

// import "./contnets.css";

console.log("in contnetsScript.tsx");

const Main = () => {
  return <div>App</div>;
};

const app = document.createElement("div");
app.id = "react-container-for-memo-extension";
document.body.appendChild(app);
ReactDOM.render(<Main />, app);
