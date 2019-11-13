import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { get } from "lodash";

window.sendContent = () => {
  if (get(window, ["webkit", "messageHandlers", "Save", "postMessage"])) {
    window.webkit.messageHandlers.Save.postMessage({
      html: window.richTextHtml
    });
  } else {
    window.Android.Save(window.richTextHtml);
  }
};

ReactDOM.render(<App />, document.getElementById("root"));
