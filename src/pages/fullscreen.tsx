export const enterFullScreen = (): void => {
  const elem = document.documentElement as HTMLElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
};

export const exitFullScreen = (): void => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
};

export const toggleFullScreen = (): void => {
  if (!document.fullscreenElement) {
    enterFullScreen();
  } else {
    exitFullScreen();
  }
};
