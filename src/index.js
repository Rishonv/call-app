import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChakraProvider } from "@chakra-ui/react";

// let call;
// let incomingCall;
// let callAgent;
// let deviceManager;
// let tokenCredential;
// const userToken = document.getElementById("token-input");
// const calleeInput = document.getElementById("callee-id-input");
// const submitToken = document.getElementById("token-submit");
// const callButton = document.getElementById("call-button");
// const hangUpButton = document.getElementById("hang-up-button");
// const acceptCallButton = document.getElementById('accept-call-button');

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
