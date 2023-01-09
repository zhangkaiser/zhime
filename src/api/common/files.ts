
export function isDir(file: File) {
  return !!file.webkitRelativePath;
}