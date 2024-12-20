import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";

let socketIo = null;

export const registerSocketEvents = (socket) => {
  socketIo = socket;

  socket.on("connect", () => {
    console.log("successfully connected to socket.io server");
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);
  });

  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });
};

export const sendPreOffer = (data) => {
  socketIo.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIo.emit("pre-offer-answer", data);
};
