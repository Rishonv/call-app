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
import { useEffect, useState, useRef, version } from "react";

export default function Call() {
  const [token, setToken] = useState("");
  const [identity, setIdentity] = useState("");
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
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef({});
  const videoStreamInit = useRef(false);

  // console.log("loc", window.location);

  // Normal
  // 8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-0cb7-d36a-fa27-63bd45603257
  // eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0wY2I3LWQzNmEtZmEyNy02M2JkNDU2MDMyNTciLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk4MTI4OTQiLCJleHAiOjE3MTk4OTkyOTQsInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTgxMjg5NH0.PAijU9XX2_HNYpg7u301aZA5Z_BeLoPOQrnsyVuAbkQPMb9OyFFNaW243nCzoK7ncxBqSd9GMxlUXtn_KnPqcs99FuzKOFPurC_MiMX5VdbVnm0AXNXgdIj8g3cKs_rao3o9g9PM_wykWTgFpf2LDxNWRJP6PIKHkYdRq2IfI2ZM8sIjje4_Uj2nB2tNlUl-68gCv6Z1fYUxEPlrMbvek6sHv1DMEt1rYV6FxzRh3rPXqb85fdoBHsmKAb3yE6CX4uhbZqj9OcgDDjBj7FRGPlDimGXgwt0YmD14a05s3beWrqwc44n415sOVZ56tdz4CbT1ujLNXYblxQtXnF85dw
  // Incognito
  // 8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-0cb9-b005-ef27-63bd456043a5
  // eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0wY2I5LWIwMDUtZWYyNy02M2JkNDU2MDQzYTUiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk4MTMwMTYiLCJleHAiOjE3MTk4OTk0MTYsInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTgxMzAxNn0.a56rwnGLpTfDuhwaYr1rsWLfEeuc5alXrf4ZUxqngawsLoTQlJ6YYK0UnYoblxKyZcwS8dd4Zst14hzYyTGwbLWj9lxojNe1qq0TLj3X2bIFZ1Edh-TQKOTSNYZMnccGlt_CdyYif9pBAJPN3DOJp7t32K7rzTzoohvk6u-is3SGBWNsA_mllDSb5AWU-4pb4_1W638SWlNpU_-W2VGo3xNFXq8bU91udF6RiFqrMtGmRGqI9L-p9H-yBp4Ot1b69kyjyvjYfaN1ssl9f_KstD4oeMYwWzXQA-6R9VI9YTZIKwK7PPiGWtfJAChsvu-uwh1APEnAenMs_tXPGR69tA

  useEffect(() => {
    if (token) {
      initializeCallAgent(); //gets Devices in the init
    }
  }, [token]);

  // Handles getting local and remote participants
  useEffect(() => {
    async function onCallStateChange() {
      console.log(call.state);
      if (call.state === "Connected") {
        if (localVideoStream) {
          await call.startVideo(localVideoStream);
        }

        await Promise.all(
          call.remoteParticipants.map(async (participant) => {
            subscribeToRemoteParticipants(participant);
            await Promise.all(
              participant.videoStreams.map(async (stream) => {
                subscribeToRemoteVideoStream(participant, stream);
              })
            );
          })
        );
      } else if (call.state === "Disconnected") {
        setCall(null);
        if (localVideoStream) {
          localVideoStream.dispose();
          setLocalVideoStream(null);
        }
        setRemoteParticipants([]);
      }
    }

    async function onLocalVideoStreamsUpdated() {
      const videoStream = call.localVideoStreams[0];
      if (videoStream) {
        setLocalVideoStream(videoStream);
        if (videoRef.current) {
          const renderer = new VideoStreamRenderer(videoStream);
          const view = await renderer.createView();
          videoRef.current.appendChild(view.target);
        }
      }
    }

    async function onRemoteParticipantsUpdated(e) {
      await Promise.all(
        (e.added || []).map(async (participant) => {
          subscribeToRemoteParticipants(participant);
          await Promise.all(
            (participant.videoStreams || []).map(async (stream) => {
              await subscribeToRemoteVideoStream(participant, stream);
            })
          );
        })
      );

      setRemoteParticipants((prev) =>
        prev.filter(
          (p) =>
            !(e.removed || []).some(
              (removedParticipant) =>
                removedParticipant.identifier.communicationUserId === p.id
            )
        )
      );

      await updateRemoteParticipants();
    }

    if (call) {
      call.on("stateChanged", onCallStateChange);
      call.on("remoteParticipantsUpdated", onRemoteParticipantsUpdated);

      updateRemoteParticipants();
    }

    return () => {
      if (call) {
        call.off("stateChanged", onCallStateChange);
        call.off("localVideoStreamsUpdated", onLocalVideoStreamsUpdated);
        call.off("remoteParticipantsUpdated", onRemoteParticipantsUpdated);
      }
    };
  }, [call, localVideoStream]);

  // Sets access token based on url (v=1 || v = 2)
  useEffect(() => {
    const version = new URLSearchParams(window.location.search).get("v");
    if (version === "1") {
      setIdentity(
        "8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-16fa-5e98-9b2a-63bd45605257"
      );
      setToken(
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0xNmZhLTVlOTgtOWIyYS02M2JkNDU2MDUyNTciLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk5ODUwMjciLCJleHAiOjE3MjAwNzE0MjcsInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTk4NTAyN30.rPF36YI7vasVv6XjHHtDzrcJ7smHcscJD1uJ59ERcGa_xg2Y3zA5681W6MM6sf8I0Sw4cqlzGa-e4IySbFvDJhPbyR3GqTwT_coxDSY9bb_kFJWzkAS5IzcIBAC1mooRZ72goE6HzQmo6udd9FLrOa6Ifu2sAuckGmpCi2VyZi87s3oPzsocOxAuhlXFQnTyi8h53_OhYBDue9XFErZO7MlJfWNoxnu5lolHMAu3oY28d1hA4ZWUIiPl7kHFV7HPezGV5I1dwJ8Lf9AXcYWnQyYznmp9qnhGhgjWBOBNREPBe8st8u-1EQkJBtwJjkyR_OfmkjnWWFnX7HHR8qBGAw"
      );
    } else if (version === "2") {
      setIdentity(
        "8:acs:df086420-e662-45e6-8996-09f70dc31171_00000021-16fb-1b91-9b2a-63bd456052b3"
      );
      setToken(
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRmMDg2NDIwLWU2NjItNDVlNi04OTk2LTA5ZjcwZGMzMTE3MV8wMDAwMDAyMS0xNmZiLTFiOTEtOWIyYS02M2JkNDU2MDUyYjMiLCJzY3AiOjE3OTIsImNzaSI6IjE3MTk5ODUwNzYiLCJleHAiOjE3MjAwNzE0NzYsInJnbiI6ImFlIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZGYwODY0MjAtZTY2Mi00NWU2LTg5OTYtMDlmNzBkYzMxMTcxIiwicmVzb3VyY2VMb2NhdGlvbiI6InVhZSIsImlhdCI6MTcxOTk4NTA3Nn0.kFkCBxg9EbkJjVIQM1hrNjPqMKSNnQo46CRX3IMGh3WXsFkJ6lefSqXq8TVNst13S1jwrnl065A-cl5dGJtZFF_c8Mcr9DRzdRCHBTX8BYYaKu3Tp3pTlOvK7nqKDPCbTG8RG5cDfGTJ-0JBWLvfyQjGs6n1lOD3za0ZTG7E3cJj5Hzic1LVc9vc1ISC90wMlaphxWz0d2OYDKe8vxJRuSFG_PjZkXMJlexqsS6GVKxei7ePkv-WiFmx-q8j_u9-E9zSUI2DDMIdMQW_Cmub3eZBnhH4m3SyYWi2lUJWxlTO1o2hWtHN7IwDOIU40-JEOeHYkUSmqTwndX9WrwAYtg"
      );
    }
  }, []);

  // useEffect(() => {
  //   const renderLocalVideo = async () => {
  //     console.log("Attempting to render local video");
  //     console.log("localVideoStream:", localVideoStream);
  //     console.log("videoRef.current:", videoRef.current);
  //     try {
  //       if (localVideoStream && videoRef.current) {
  //         const renderer = new VideoStreamRenderer(localVideoStream);
  //         console.log("creating view");
  //         const view = await renderer.createView();
  //         console.log("View created:", view);
  //         videoRef.current.innerHTML = "";
  //         videoRef.current.appendChild(view.target);
  //         console.log("Local should now be visible");
  //       } else {
  //         console.warn("Cannot render local video");
  //       }
  //     } catch (error) {
  //       console.error("Error displaying local video:", error);
  //     }
  //   };

  //   renderLocalVideo();
  //   return () => {
  //     console.log("Cleanup for local", videoRef.current);
  //     if (videoRef.current) {
  //       videoRef.current.innerHTML = "";
  //     }
  //   };
  // }, [localVideoStream]);
  useEffect(() => {
    if (videoRef.current && localVideoStream) {
      console.log("VIDEOREF: ", videoRef.current);
      renderLocalVideo();
    }
  }, [videoRef.current, localVideoStream]);

  const renderLocalVideo = async () => {
    console.log("Attempting to render local video");
    console.log("localVideoStream:", localVideoStream);
    console.log("videoRef.current:", videoRef.current);

    if (!localVideoStream || !videoRef.current) {
      console.warn("localVideoStream or videoRef.current is not available");
      return;
    }

    try {
      console.log("Creating VideoStreamRenderer");
      const renderer = new VideoStreamRenderer(localVideoStream);
      console.log("Creating view");
      const view = await renderer.createView();
      console.log("View created:", view);

      console.log("Clearing videoRef.current");
      videoRef.current.innerHTML = "";

      console.log("Appending view to videoRef.current");
      videoRef.current.appendChild(view.target);
      console.log("Local video should now be visible");
    } catch (error) {
      console.error("Error displaying local video:", error);
    }
  };

  useEffect(() => {
    const renderRemoteVideos = async () => {
      try {
        await Promise.all(
          remoteParticipants.map(async (participant) => {
            if (
              participant.videoStream &&
              remoteVideoRef.current[participant.id]
            ) {
              const stream = participant.videoStream;
              if (!stream.isAvailable) {
                console.log(
                  `Stream is not available for participant ${participant.id} yet`
                );
                const availabilityChanged = () => {
                  if (stream.isAvailable) {
                    renderStream(stream, participant.id);
                    stream.off("isAvailableChanged", availabilityChanged);
                  }
                };
                stream.on("isAvailableChanged", availabilityChanged);
              } else {
                await renderStream(stream, participant.id);
              }
            }
          })
        );
      } catch (error) {
        console.error("Error rendering remote videos:", error);
      }
    };
    const renderStream = async (stream, participantId) => {
      const renderer = new VideoStreamRenderer(stream);
      const view = await renderer.createView();
      const videoElement = remoteVideoRef.current[participantId];
      if (videoElement) {
        videoElement.innerHTML = "";
        videoElement.appendChild(view.target);
      } else {
        console.error(
          `No video element found for participant ${participantId}`
        );
      }
    };
    renderRemoteVideos();
    return () => {
      Object.values(remoteVideoRef.current).forEach((ref) => {
        if (ref) ref.innerHTML = "";
      });
    };
  }, [remoteParticipants]);

  const initializeCallAgent = async () => {
    if (!token || callAgent) {
      return;
    }
    try {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      console.log(tokenCredential);
      const agent = await callClient.createCallAgent(tokenCredential, {
        displayName: identity,
      });
      setCallAgent(agent);
      let devices;
      try {
        devices = await callClient.getDeviceManager();
        console.log("Device Manage:", devices);
      } catch (deviceError) {
        console.warn("Failed to get Device manager:", deviceError);
      }
      if (devices) {
        await getDevices(devices);
      } else {
        console.warn("Device manager not available");
      }

      setDeviceManager((prevState) => ({ ...prevState, manager: devices }));
      agent.on("incomingCall", handleIncomingCall);
    } catch (error) {
      console.error("Failed to initialize call agent:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
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

  const getDevices = async (devices) => {
    if (!devices) {
      console.error("Device manager is not available");
      return;
    }

    try {
      let camera, mics, speakers;

      if (typeof devices.getCameras === "function") {
        camera = (await devices.getCameras())[0];
      } else {
        console.warn("getCameras method is not available");
      }

      if (typeof devices.getMicrophones === "function") {
        mics = await devices.getMicrophones();
      } else {
        console.warn("getMicrophones method is not available");
        mics = [];
      }

      if (typeof devices.getSpeakers === "function") {
        speakers = await devices.getSpeakers();
      } else {
        console.warn("getSpeakers method is not available");
        speakers = [];
      }

      setDeviceManager((prevState) => ({
        ...prevState,
        manager: devices,
        microphones: mics || [],
        speakers: speakers || [],
        camera: camera || [],
      }));

      if (camera && !videoStreamInit.current) {
        const videoStream = new LocalVideoStream(camera);
        console.log("Setting localVideoStream:", videoStream);
        setLocalVideoStream(videoStream);
        videoStreamInit.current = true;
      } else if (!camera) {
        console.warn("No camera device found or camera access not available");
      }
    } catch (error) {
      console.error("Error getting devices:", error);
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

  const removeLocalVideoStream = async () => {
    try {
      if (localVideoStream) {
        await stopVideo(videoRef.current);
        localVideoStream.dispose();
        setLocalVideoStream(null);
      }
    } catch (error) {
      console.error("Error removing local video stream:", error);
    }
  };

  const subscribeToRemoteParticipants = (participant) => {
    participant.on("videoStreamsUpdated", async (e) => {
      await Promise.all(
        e.added.map(async (stream) => {
          subscribeToRemoteVideoStream(participant, stream);
        })
      );
      await Promise.all(
        e.removed.map(async (stream) => {
          unsubscribeFromRemoteVideoStream(participant, stream);
        })
      );
      await updateRemoteParticipants();
    });
  };

  const updateRemoteParticipants = async () => {
    if (call) {
      const participants = call.remoteParticipants.map((participant) => ({
        id: participant.identifier.communicationUserId,
        displayName: participant.displayName,
        videoStream: participant.videoStreams[0] || null,
      }));
      setRemoteParticipants(participants);
    }
  };

  const subscribeToRemoteVideoStream = (participant, stream) => {
    setRemoteParticipants((prevParticipants) =>
      prevParticipants.map((p) =>
        p.id === participant.identifier.communicationUserId
          ? { ...p, videoStream: stream }
          : p
      )
    );
  };

  const unsubscribeFromRemoteVideoStream = (participant) => {
    setRemoteParticipants((prevParticipants) =>
      prevParticipants.map((p) =>
        p.id === participant.identifier.communicationUserId
          ? { ...p, videoStream: null }
          : p
      )
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text>Your Identity: {identity}</Text>

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
          <Box
            ref={videoRef}
            width="320px"
            height="240px"
            border="1px solid gray"
          />
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
          <Text>Remote Participants:</Text>
          <HStack wrap="wrap" spacing={4} justify="center">
            {remoteParticipants.map((participant) => (
              <Box
                key={participant.id}
                width="320px"
                height="240px"
                border="1px solid gray"
                ref={(el) => (remoteVideoRef.current[participant.id] = el)}
              >
                {!participant.videoStream && (
                  <Text>
                    No video available for
                    {participant.displayName || "Remote Participant"}
                  </Text>
                )}
              </Box>
            ))}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
