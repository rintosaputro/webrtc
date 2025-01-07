import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;

const defaultConstraints = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:13902",
    },
  ],
};

// untuk mendapat vidoe dan audio dari local
export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((err) => {
      console.error(
        "error occured when trying to get an access to get local video and audio",
        err
      );
    });
};

// we need execute that function before send webrtc offer
const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);
  console.log("create peer connection");
  peerConnection.onicecandidate = (event) => {
    console.log("getting ice candidates from stun server");
    if (event.candidate) {
      // send our ice candidates to other peer
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("succesfully connected with other peer");
    }
  };

  // receiving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to peer connection
  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendPreOffer = (callType, callePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: callePersonalCode,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      callePersonalCode,
    };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    console.log("showing incoming call dialog");
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler); // ui panggilan masuk
  }
};

// remote calle
const acceptCallHandler = () => {
  console.log("call accepted");
  createPeerConnection(); // create peer ketika calle menjawab panggilan
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
  console.log("rejecting the call");
};

const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };

  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};
// for remote caller
export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that callee not found
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that call is not abble to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    ui.showInfoDialog(preOfferAnswer);
    // show dialog that call is rejected by callee
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection(); // create peer untuk si caller ketika di jawab panggilannya
    // send webRTC offer
    sendWebRTCOffer();
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer: offer,
  });
};

export const handleWebRTCOffer = async (data) => {
  console.log("ketika mendapat offer langsung create answer", data);
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
    answer,
  });
};

export const handleWebRTCAnswer = async (data) => {
  console.log("ketika mendapat answer setRemote desc", data);
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ice candidate",
      err
    );
  }
};

let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;
    const senders = peerConnection.getSenders();

    const sender = senders.find(
      (sender) => sender.track.kind === localStream.getVideoTracks()[0].kind
    );

    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    // stop screen sharing stream
    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());

    store.setScreenSharingActive(!screenSharingActive);

    ui.updateLocalVideo(localStream);
  } else {
    console.log("switching for screen sharing");

    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      store.setScreenSharingStream(screenSharingStream);

      // replace track wich sender is sending
      const senders = peerConnection.getSenders();

      const sender = senders.find(
        (sender) =>
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
      );

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (error) {
      console.error(
        "error occured when trying to get screen sharing stream",
        error
      );
    }
  }
};
