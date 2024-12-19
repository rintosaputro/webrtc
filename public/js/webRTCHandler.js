import * as wss from "./wss.js";

export const sendPreOffer = (callType, callePersonalCode) => {
  const data = {
    callType,
    callePersonalCode,
  };

  wss.sendPreOffer(data);
};

export const handlePreOffer = (data) => {
  console.log("preoffer came webrtch handler", data);
};
