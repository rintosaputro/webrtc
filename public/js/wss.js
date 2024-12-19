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
    console.log("preoffer came");
    webRTCHandler.handlePreOffer(data);
  });
};

export const sendPreOffer = (data) => {
  console.log("emmiting to sereer pre offer event");
  socketIo.emit("pre-offer", data);
};
