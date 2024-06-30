import {
  CallClient,
  LocalVideoStream,
  VideoStreamRenderer,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import {
  Button,
  VStack,
  HStack,
  Select,
  Text,
  Input,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

export default function Call() {
  const [token, setToken] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [call, setCall] = useState(null);
  const [callAgent, setCallAgent] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [deviceManager, setDeviceManager] = useState({
    manager: null,
    microphones: [],
    speakers: [],
  });
  const [isMuted, setIsMuted] = useState(false);
  const [localVideoStream, setLocalVideoStrea] = useState(null);

  // Normal
  // 8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-03fd-17c8-952b-63bd4560437c
  // eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0wM2ZkLTE3YzgtOTUyYi02M2JkNDU2MDQzN2MiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk2NjY0MzkiLCJleHAiOjE3MTk3NTI4MzksInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTY2NjQzOX0.Zdbe4IXssB2rK6OzxyzWknYMLsUU_6hOb3VcBWN2c1_AqIOGl1_qiPCtYmgDB3AExnu05qDL-3XQm9zhxxuK5pcnWA2sFRsaRakHnayOq7ix1rU1u_piQYlSygmUHkjS4lb0ZnwKAP9GsMlLd4uFfjQEGUw0F4OsoUK9W31PjvSxoNLAIBvNjNoWGjP5YUIWC8BoyDw0dqgQwfW3dGQz2oLjRC77J0tZmdXTDIGMqVhPG9brPfiXQJTZ0NwSNsammj6g4lh1g_nzEarQh6wzox_xhkMf2k0sOiSeX364UJfUaj-JjBmrWF6EEOipP4PW7T_j5Jq7y2uBFiqh230SYQ

  // Incognito
  // 8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-0412-4be6-fa27-63bd456063d5
  // eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0wNDEyLTRiZTYtZmEyNy02M2JkNDU2MDYzZDUiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk2Njc4MjgiLCJleHAiOjE3MTk3NTQyMjgsInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTY2NzgyOH0.LuCaNGqviQsHvQMvw6Zg2M0BqI3mv6ACC20MWRdZA9ivbrnz_VpUtWiwUjl0_ZDDE5Y0pSDdKRTwUfBuPiaHFOyBYb_NTgYycgYFBx30bF9YIeSENJPecBuGv0ms0M981eYZ3wbRvP8LSRQ2FzyAxpRWdIVZ2HJtszVxabLlBuhkFTL5VZyQA7QB4zUDh_dV_64f5OXIVJK346SSWKF_5sYsy0auKyIPtNysfaQmp9lqe2oxbWgdxRIEcA9-VFv3053BPB91znoXirbxNiLrQdG_5qlhqvJafNlz0oF9mmRhkOSwDZzPd7_GmWS7L90FzJJrhzWA1AAsezcnvVALvg
  const localVideoContainer = useRef(null);

  useEffect(() => {
    if (deviceManager) {
      getDevices();
    }
  }, [deviceManager.manager]);

  useEffect(() => {
    if (token) {
      initializeCallAgent();
    }
  }, []);

  useEffect(() => {
    function onCallStateChange() {
      console.log(call.state);
      if (call.state === "Disconnected") {
        setCall(null);
      }
    }
    if (call) {
      call.on("stateChanged", onCallStateChange);
    }
    return () => {
      if (call) {
        call.off("stateChanged", onCallStateChange);
      }
    };
  }, [call]);

  const initializeCallAgent = async () => {
    if (!token || callAgent) {
      return;
    }
    try {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      console.log(tokenCredential);
      const agent = await callClient.createCallAgent(tokenCredential);
      setCallAgent(agent);
      const devices = await callClient.getDeviceManager();
      setDeviceManager((prevState) => ({ ...prevState, manager: devices }));
      console.log(devices);
      agent.on("incomingCall", handleIncomingCall);
    } catch (error) {
      console.error("Failed to initialize call agent:", error);
    }
  };

  const handleIncomingCall = (event) => {
    const incoming = event.incomingCall;
    setIncomingCall(incoming);
    incoming.on("callEnded", (e) => {
      setIncomingCall(null);
      console.log(e);
    });
  };

  const answerCall = async () => {
    if (incomingCall) {
      const newCall = await incomingCall.accept();
      setCall(newCall);
      setIncomingCall(null);
    }
  };

  const rejectCall = async () => {
    if (incomingCall) {
      await incomingCall.reject();
      setIncomingCall(null);
    }
  };

  const hangUpCall = async () => {
    if (call) {
      await call.hangUp({ forEveryone: true });
      setCall(null);
    }
  };

  const startCall = async () => {
    if (callAgent && recipientId) {
      console.log(recipientId);
      const newCall = callAgent.startCall(
        [{ communicationUserId: recipientId }],
        { audioOptions: { muted: false } }
      );
      setCall(newCall);
    }
  };

  const getDevices = async () => {
    if (deviceManager.manager) {
      const camera = (await deviceManager.getCameras())[0];
      const mics = await deviceManager.manager.getMicrophones();
      const speakers = await deviceManager.manager.getSpeakers();
      if (camera) {
        const videoStream = new LocalVideoStream(camera);
        setLocalVideoStrea(videoStream);
      } else {
        console.error(`No camera device found on the system`);
      }
      setDeviceManager((prevState) => ({
        ...prevState,
        microphones: mics,
        speakers: speakers,
      }));
    }
  };

  const toggleMute = async () => {
    if (call) {
      if (call.isMuted) {
        await call.unmute();
      } else {
        await call.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const selectDevice = async (deviceType, deviceId) => {
    if (deviceManager.manager) {
      const device = deviceManager[deviceType].find((d) => d.id === deviceId);
      if (device) {
        switch (deviceType) {
          case "microphones":
            await deviceManager.manager.selectMicrophone(device);
            break;
          case "speakers":
            await deviceManager.manager.selectSpeaker(device);
            break;
        }
      }
    }
  };

  const displayLocalVideoStream = async () => {
    try {
      const localVideoStreamRenderer = new VideoStreamRenderer(
        localVideoStream
      );
      const view = await localVideoStreamRenderer.createView();
      localVideoContainer.hidden = false;
      localVideoContainer.appendChild(view.target);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Input
        placeholder="Enter your access token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <Button onClick={initializeCallAgent} isDisabled={!token || callAgent}>
        Initialize Call Agent
      </Button>

      {callAgent && (
        <>
          <Input
            placeholder="Enter recipient's user ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
          <Button onClick={startCall} isDisabled={!recipientId || call}>
            Start Call
          </Button>
        </>
      )}

      {incomingCall && (
        <HStack>
          <Text>Incoming call...</Text>
          <Button onClick={answerCall}>Answer</Button>
          <Button onClick={rejectCall}>Reject</Button>
        </HStack>
      )}

      {call && (
        <VStack>
          <Text>In a call</Text>
          <Box ref={localVideoContainer}></Box>
          <Button onClick={hangUpCall}>Hang Up</Button>
          <Button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</Button>
          <Select onChange={(e) => selectDevice("microphones", e.target.value)}>
            {deviceManager.microphones.map((mic) => (
              <option key={mic.id} value={mic.id}>
                {mic.name}
              </option>
            ))}
          </Select>
          <Select onChange={(e) => selectDevice("speakers", e.target.value)}>
            {deviceManager.speakers.map((speaker) => (
              <option key={speaker.id} value={speaker.id}>
                {speaker.name}
              </option>
            ))}
          </Select>
        </VStack>
      )}
    </VStack>
  );
}
