export const getIncomingCallDialog = (
  callTYpeInfo,
  acceptCallHandler,
  rejectCallHandler
) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");

  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `Incoming ${callTYpeInfo} Call`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  image.src = "./utils/images/dialogAvatar.png";
  imageContainer.appendChild(image);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("dialog_button_container");

  const acceptCallButton = document.createElement("button");
  acceptCallButton.classList.add("dialog_accept_call_button");
  const acceptCallImage = document.createElement("img");
  acceptCallImage.classList.add("dialog_button_image");
  acceptCallImage.src = "./utils/images/acceptCall.png";
  acceptCallButton.appendChild(acceptCallImage);
  buttonsContainer.appendChild(acceptCallButton);

  const rejectCallButton = document.createElement("button");
  rejectCallButton.classList.add("dialog_reject_call_button");
  const rejectCallImage = document.createElement("img");
  rejectCallImage.classList.add("dialog_button_image");
  rejectCallImage.src = "./utils/images/rejectCall.png";
  rejectCallButton.appendChild(rejectCallImage);
  buttonsContainer.appendChild(rejectCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonsContainer);

  acceptCallButton.addEventListener("click", acceptCallHandler);
  rejectCallButton.addEventListener("click", rejectCallHandler);

  return dialog;
};

export const getCallingDialog = (rejectCallHandler) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");

  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");
  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `Calling`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");
  image.src = "./utils/images/dialogAvatar.png";
  imageContainer.appendChild(image);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("dialog_button_container");

  const hangUpCallButton = document.createElement("button");
  hangUpCallButton.classList.add("dialog_reject_call_button");
  const hangUpCallImage = document.createElement("img");
  hangUpCallImage.classList.add("dialog_button_image");
  hangUpCallImage.src = "./utils/images/rejectCall.png";
  hangUpCallButton.append(hangUpCallImage);
  buttonsContainer.appendChild(hangUpCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonsContainer);

  return dialog;
};
