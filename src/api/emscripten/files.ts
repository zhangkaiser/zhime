import { decompressionFile } from "src/api/common/compress";

export function getFilenameByPath(path: string) {
  let paths = path.split('/').filter((p) => !!p);
  return paths[-1];
}

export function getBlobFile(fs: typeof FS, path: string): Blob {
  let data = fs.readFile(path);
  return new Blob([data.buffer]);
}

export function getFileFile(fs: typeof FS, path: string): File {
  let data = fs.readFile(path);
  return new File([data.buffer], getFilenameByPath(path));
}

export function getDataURLByFileReader(blob: Blob): Promise<{url: string}> {

  return new Promise((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.onloadend = (ev) => {
      let result = ev.target?.result
      if (!result) reject("Not loaded result.");
      resolve({
        url: result as string
      });
    }
    fileReader.onerror = reject;
    fileReader.readAsDataURL(blob);
  })
}

export async function downloadFileUseChromeDownloadAPI(fs: typeof FS, path: string) { 
  let file = getFileFile(fs, path);

  let data = await getDataURLByFileReader(file);

  chrome.downloads.download({
    url: data['url'],
    filename: file.name
  });  
}

export async function downloadFileUseChromeTabsAPI(fs: typeof FS, path: string) {
  let blob = getBlobFile(fs, path);
  let data = await getDataURLByFileReader(blob);

  chrome.tabs.create({
    url: data['url']
  });
}

export interface IFile {
  stream?: ReadableStream;
  u8?: Uint8Array;
  name: string;
  webkitRelativePath?: string;
}

export async function writeFileFromFile(fs: typeof FS,file: File | IFile, path = "", isRelative = false) {
  
  let basePath = "";
  if (isRelative) {
    basePath = path;
    path = path + "/" + file.name;
  } else {
    path = (path ? path + "/" : "") + (file.webkitRelativePath ? file.webkitRelativePath : file.name);
    basePath = path.replace(file.name, "");
  }

  let fileData;
  if (file instanceof File) {
    let buffer = await file.arrayBuffer();
    fileData = new Uint8Array(buffer);
  } else {
    if (file.stream) {
      fileData = new Uint8Array(await new Response(file.stream).arrayBuffer());
    } else if(file.u8) {
      fileData = file.u8;
    } else {
      throw new Error("Empty file.");
    }
  }

  (fs as any).createPath("/", basePath, true, true);
  try {
    // First,delete file.
    FS.unlink(path);
  } catch(e) {
    // pass.
  }
  FS.createDataFile(path, "", fileData, true, true, true);    
  return true;
}

export function writeFileFromFileList(fs: typeof FS, files: (File | IFile)[] | FileList, path: string = "", relative: boolean = true) {
  
  let promises = [];
  for (let file of files) {
    promises.push(writeFileFromFile(fs, file, path, relative));
  }

  return Promise.all(promises);
}

export function writeFileAndDecompressionFromFileList(fs: typeof FS, files: FileList | File[], path: string = "", relative: boolean = true) {
  let promises = [];
  for (let file of files) {

    if (/\.gz$/.test(file.name)) {
      let names = file.name.split(".");
      let compressFormat =  names.pop();
      let readableStream = decompressionFile(file, "gzip");

      promises.push(writeFileFromFile(
        fs, 
        { stream: readableStream, name: names.join(".") }, 
        path, 
        relative
      ));
    } else {
      promises.push(writeFileFromFile(fs, file, path, relative));
    }

  }

  return Promise.all(promises);

}