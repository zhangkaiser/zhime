

function getEntries(entry: FileSystemDirectoryEntry, filePromiseLists:Promise<FileEntry>[], recursive = false): Promise<boolean> {

  return new Promise(async (resolve, reject) => {
    if (entry.isDirectory) {
      let reader = entry.createReader();

      await new Promise(async (resolve1, reject1) => {
        reader.readEntries(async (entries) => {
          let entriesPromise: Promise<boolean>[] = [];
        
          entries.forEach((entry1) => {
            entriesPromise.push(getEntries(entry1 as FileSystemDirectoryEntry, filePromiseLists, recursive));
          });
          await Promise.allSettled(entriesPromise);
          resolve1(true);
        }, reject1);
      });
    } else {
      filePromiseLists.push(Promise.resolve(entry as any as FileEntry));
    }
    resolve(true);

  });
}

interface IGetFilesOptions {
  regexp?: RegExp,
  recursive?: boolean
}

export function getExtensionPackageFiles(path: string | string[], options: IGetFilesOptions = { recursive: true }): Promise<FileEntry[]> {

  return new Promise((resolve, reject) => {
    chrome.runtime.getPackageDirectoryEntry(async (rootEntry) => {

      let filePromiseLists: Promise<FileEntry>[] = [];
    
      if (Array.isArray(path)) {
        path.forEach((filePath) => {
          filePromiseLists.push(
            new Promise((resolve1, reject1) => {
              rootEntry.getFile(filePath, {}, (fileEntry) => {
                if (fileEntry.isFile) {
                  resolve1(fileEntry)
                }
                reject1();
              }, reject1);
            })
          );
       });
      } else {

        await (new Promise(
          (resolve1, reject1) => {

            rootEntry.getDirectory(path, {}, (pathEntry) => {
              getEntries(pathEntry, filePromiseLists, options.recursive).then((bool) => {
                resolve1(bool);
              }).catch(reject1);
            }, reject1);
          })
        )
      }


      let all = await Promise.allSettled(filePromiseLists);

      let newLists: FileEntry[] = [];
      all.forEach((value) => {
        if (value.status == "fulfilled") {
          if (options.regexp && !options.regexp.test(value.value.name)) return ;
          newLists.push(value.value);
        }
      });

      resolve(newLists);
    })
  })
  
}


export function getFileList(entries: FileEntry[]) {
  let fileListPromise = entries.map(
    (fileEntry) => 
      new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
      }) as Promise<File>
  );

  return Promise.all(fileListPromise);
}