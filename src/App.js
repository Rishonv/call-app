import "./App.css";
import { useEffect, useRef, useState } from "react";
import Call from "./peer-peer";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <Call></Call>
    </ChakraProvider>
  );
}

export default App;

//const [callAgent, setCallAgent] = useState(null);
// const [call, setCall] = useState(null)
// const [incomingCall, setIncomingCall] = useState(null)
// const submitTokenRef = useRef(null);
// const userTokenRef = useRef(null);
// const callButtonRef = useRef(null);
// const acceptCallButtonRef = useRef(null);
// const calleeInputRef = useRef(null);
// const hangUpButtonRef = useRef(null);

// useEffect(()=> {
//   if (submitTokenRef.current && callButtonRef.current && hangUpButtonRef.current) {
//     submitTokenRef.current.addEventListener("click", async () => {
//       const callClient = new CallClient();
//       const userTokenCredential = userTokenRef.current.value;
//       try {
//         const tokenCredential = new AzureCommunicationTokenCredential(userTokenCredential);
//         const agent = await callClient.createCallAgent(tokenCredential);
//         setCallAgent(agent)
//         const deviceManager = await callClient.getDeviceManager();
//         await deviceManager.askDevicePermission({ audio: true });
//         callButtonRef.current.disabled = false;
//         submitTokenRef.current.disabled = true;
//         // Listen for an incoming call to accept.
//         agent.on('incomingCall', async (args) => {
//           try {
//             setIncomingCall(args.incomingCall)
//             acceptCallButtonRef.current.disabled = false;
//             callButtonRef.current.disabled = true;
//           } catch (error) {
//             console.error(error);
//           }
//         });
//       } catch(error) {
//         window.alert("Please submit a valid token!");
//       }
//     });
//     callButtonRef.current.addEventListener("click", ()=>{
//       if (callAgent){
//         const userToCall = calleeInputRef.current.value;
//         const newCall = callAgent.startCall([{ id: '8:echo123'/*userToCall*/}],{}) // echo is a bot so you can test if audio devices are working
//         setCall(newCall);
//         hangUpButtonRef.current.disabled = false;
//         callButtonRef.current.disabled = true;
//       }
//     });
//     hangUpButtonRef.current.addEventListener("click", () => {
//       if (call) {
//         // end the current call
//         // The `forEveryone` property ends the call for all call participants.
//         call.hangUp({ forEveryone: true });
//         // toggle button states
//         hangUpButtonRef.current.disabled = true;
//         callButtonRef.current.disabled = false;
//         submitTokenRef.current.disabled = false;
//         acceptCallButtonRef.current.disabled = true;
//         setCall(null);
//       }
//     });
//     acceptCallButtonRef.current.addEventListener("click", async () => {
//       if (incomingCall) {
//         try {
//           const acceptedCall = await incomingCall.accept();
//           setCall(acceptedCall);
//           acceptCallButtonRef.current.disabled = true;
//           hangUpButtonRef.current.disabled = false;
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     });
//   }
// }, [callAgent, call, incomingCall])

// return (
//   <div className="App">
//     <input ref={userTokenRef} type='text' placeholder='Enter user token'/>
//     <button ref={submitTokenRef}>Submit Token</button>
//     <input ref={calleeInputRef} type="text" placeholder="Enter callee ID" />
//     <button ref={callButtonRef} disabled>Call</button>
//     <button ref={acceptCallButtonRef} disabled>Accept Call</button>
//     <button ref={hangUpButtonRef} disabled>Hang Up</button>
//   </div>
// );
