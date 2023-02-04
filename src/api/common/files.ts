
export function isDir(file: File) {
  return !!file.webkitRelativePath;
}

export function getFileList(entries: string[]) {
  let fetchingFiles = entries.map((entry) => fetch(entry).then(res => res.blob()));
  return Promise.all(fetchingFiles).then(
    blobs => blobs.map(
      (blob, i) => new File([blob], entries[i].split("/").pop()!)
    )
  );
}