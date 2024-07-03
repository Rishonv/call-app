displayLocalVideoStream = async () => {
  try {
    localVideoStreamRenderer = new VideoStreamRenderer(localVideoStream);
    const view = await localVideoStreamRenderer.createView();
    localVideoContainer.hidden = false;
    localVideoContainer.appendChild(view.target);
  } catch (error) {
    console.error(error);
  }
};
