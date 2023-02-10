
export function addBeforeUnloadInfo(info: string) {
  window.onbeforeunload = (e) => {
    e.returnValue = info;
    return info;
  };
}

export function removeBeforeUnloadInfo() {
  window.onbeforeunload = null;
}