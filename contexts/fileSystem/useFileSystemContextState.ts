import type * as IBrowserFS from "browserfs";
import type HTTPRequest from "browserfs/dist/node/backend/HTTPRequest";
import type IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import type IsoFS from "browserfs/dist/node/backend/IsoFS";
import type MountableFileSystem from "browserfs/dist/node/backend/MountableFileSystem";
import type OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import type ZipFS from "browserfs/dist/node/backend/ZipFS";
import type { BFSCallback } from "browserfs/dist/node/core/file_system";
import type { FSModule } from "browserfs/dist/node/core/FS";
import { handleFileInputEvent } from "components/system/Files/FileManager/functions";
import FileSystemConfig from "contexts/fileSystem/FileSystemConfig";
import type { UpdateFiles } from "contexts/session/types";
import { basename, dirname, extname, join } from "path";
import * as BrowserFS from "public/libs/browserfs/browserfs.min.js";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";

type FilePasteOperations = Record<string, "copy" | "move">;

export type FileSystemContextState = {
  fs?: FSModule;
  mountFs: (url: string) => Promise<void>;
  setFileInput: React.Dispatch<
    React.SetStateAction<HTMLInputElement | undefined>
  >;
  unMountFs: (url: string) => void;
  addFile: (callback: (name: string, buffer?: Buffer) => void) => void;
  resetFs: () => Promise<void>;
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void;
  addFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  removeFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  pasteList: FilePasteOperations;
  copyEntries: (entries: string[]) => void;
  moveEntries: (entries: string[]) => void;
  mkdirRecursive: (path: string, callback: () => void) => void;
};

const { BFSRequire, configure, FileSystem } = BrowserFS as typeof IBrowserFS;

const useFileSystemContextState = (): FileSystemContextState => {
  const [fs, setFs] = useState<FSModule>();
  const [fileInput, setFileInput] = useState<HTMLInputElement>();
  const [fsWatchers, setFsWatchers] = useState<Record<string, UpdateFiles[]>>(
    {}
  );
  const [pasteList, setPasteList] = useState<FilePasteOperations>({});
  const updatePasteEntries = (
    entries: string[],
    operation: "copy" | "move"
  ): void =>
    setPasteList(
      Object.fromEntries(entries.map((entry) => [entry, operation]))
    );
  const copyEntries = (entries: string[]): void =>
    updatePasteEntries(entries, "copy");
  const moveEntries = (entries: string[]): void =>
    updatePasteEntries(entries, "move");
  const addFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void =>
      setFsWatchers((currentFsWatcher) => ({
        ...currentFsWatcher,
        [folder]: [...(currentFsWatcher[folder] || []), updateFiles],
      })),
    []
  );
  const removeFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void =>
      setFsWatchers((currentFsWatcher) => ({
        ...currentFsWatcher,
        [folder]: (currentFsWatcher[folder] || []).filter(
          (updateFilesInstance) => updateFilesInstance !== updateFiles
        ),
      })),
    []
  );
  const updateFolder = useCallback(
    (folder: string, newFile?: string, oldFile?: string): void => {
      const relevantPaths =
        folder === "/"
          ? [folder]
          : Object.keys(fsWatchers).filter(
              (watchedPath) =>
                watchedPath === folder ||
                (watchedPath !== "/" && watchedPath === dirname(folder)) ||
                watchedPath.startsWith(join(folder, "/"))
            );

      relevantPaths.forEach((watchedFolder) =>
        fsWatchers[watchedFolder]?.forEach((updateFiles) =>
          watchedFolder === folder
            ? updateFiles(newFile, oldFile)
            : updateFiles()
        )
      );
    },

    [fsWatchers]
  );
  const rootFs = fs?.getRootFS() as MountableFileSystem;
  const mountFs = (url: string): Promise<void> =>
    new Promise((resolve) =>
      fs?.readFile(url, (_readError, fileData = EMPTY_BUFFER) => {
        const isISO = extname(url) === ".iso";
        const createFs: BFSCallback<IsoFS | ZipFS> = (_createError, newFs) => {
          if (newFs) {
            rootFs?.mount(url, newFs);
            resolve();
          }
        };

        if (isISO) {
          FileSystem.IsoFS.Create({ data: fileData }, createFs);
        } else {
          FileSystem.ZipFS.Create({ zipData: fileData }, createFs);
        }
      })
    );
  const unMountFs = (url: string): void => rootFs?.umount(url);
  const addFile = (callback: (name: string, buffer?: Buffer) => void): void => {
    if (fileInput) {
      fileInput.addEventListener(
        "change",
        (event) => handleFileInputEvent(event, callback),
        { once: true }
      );
      fileInput.click();
    }
  };
  const resetFs = (): Promise<void> =>
    new Promise((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      const overlayFs = rootFs._getFs("/").fs as OverlayFS;
      const overlayedFileSystems = overlayFs.getOverlayedFileSystems();
      const readable = overlayedFileSystems.readable as HTTPRequest;
      const writable = overlayedFileSystems.writable as IndexedDBFileSystem;

      readable.empty();
      writable.empty((apiError) => (apiError ? reject(apiError) : resolve()));
    });
  const mkdirRecursive = (path: string, callback: () => void): void => {
    const pathParts = path.split("/").filter(Boolean);
    const recursePath = (position = 1): void => {
      const makePath = join("/", pathParts.slice(0, position).join("/"));
      const nextPart = (): void =>
        position === pathParts.length ? callback() : recursePath(position + 1);

      fs?.exists(makePath, (exists) => {
        if (exists) nextPart();
        else {
          fs.mkdir(makePath, { flag: "w" }, (error) => {
            if (!error) {
              updateFolder(dirname(makePath), basename(makePath));
              nextPart();
            }
          });
        }
      });
    };

    recursePath();
  };

  useEffect(() => {
    if (!fs) {
      configure(FileSystemConfig, () => setFs(BFSRequire("fs")));
    }
  }, [fs]);

  return {
    fs,
    mountFs,
    setFileInput,
    unMountFs,
    addFile,
    resetFs,
    updateFolder,
    addFsWatcher,
    removeFsWatcher,
    pasteList,
    copyEntries,
    moveEntries,
    mkdirRecursive,
  };
};

export default useFileSystemContextState;
