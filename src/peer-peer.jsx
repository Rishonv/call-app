import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { Button, VStack, HStack, Select, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function Call() {
  const [token, setToken] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [call, setCall] = useState(null);
  const [callAgent, setCallAgent] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [deviceManager, setdeviceManager] = useState({
    manager: null,
    microphones: [],
    speakers: [],
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (token) {
      initializeCallAgent();
    }
  }, []);

  useEffect(() => {
    if (deviceManager) {
      getDevices();
    }
  }, [deviceManager.manager]);

  const initializeCallAgent = async () => {
    if (!token) {
      return;
    }
    try {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      const agent = await callClient.createCallAgent(tokenCredential);
      setCallAgent(agent);
      const devices = await callClient.getDeviceManager();
      setdeviceManager((prevState) => ({ ...prevState, manager: devices }));
      agent.on("incomingCall", handleIncomingCall);
    } catch (error) {
      console.error("Failed to initialize call agent:", error);
    }
  };

  const handleIncomingCall = (event) => {
    const incoming = event.incomingCall;
    setIncomingCall(incoming);
    incoming.on("callEnded", () => {
      setIncomingCall(null);
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
      await call.hangUp();
      setCall(null);
    }
  };
  const startCall = async () => {
    if (startAgent && recipientId) {
      const newCall = callAgent.startCall(
        [{ communicationuserId: recipientId }],
        { audioOptions: { muted: false } }
      );
      setCall(newCall);
    }
  };

  const getDevices = async () => {
    if (deviceManager.manager) {
      const mics = await deviceManager.getMicrophones();
      const speakers = await deviceManager.getSpeakers();
      setdeviceManager((prevState) => ({
        ...prevState,
        microphones: mics,
        speakers: speakers,
      }));
    }
  };

  const toggleMute = async () => {
    if (call) {
      await call.mute(!isMuted);
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

  return (
    <VStack spacing={4} align="stretch">
      <Input
        placeholder="Enter your access token"
        value={userToken}
        onChange={(e) => setUserToken(e.target.value)}
      />
      <Button
        onClick={initializeCallAgent}
        isDisabled={!userToken || callAgent}
      >
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
          <Button onClick={() => setIncomingCall(null)}>Reject</Button>
        </HStack>
      )}

      {call && (
        <VStack>
          <Text>In a call</Text>
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
