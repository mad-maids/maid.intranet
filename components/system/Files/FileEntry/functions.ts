import type { FSModule } from "browserfs/dist/node/core/FS";
import type { ExtensionType } from "components/system/Files/FileEntry/extensions";
import extensions from "components/system/Files/FileEntry/extensions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import processDirectory from "contexts/process/directory";
import ini from "ini";
import { join } from "path";
import {
  DEFAULT_FILE_VIEWER,
  EMPTY_BUFFER,
  IMAGE_FILE_EXTENSIONS,
  MP3_MIME_TYPE,
  SHORTCUT_EXTENSION,
  SYSTEM_FILES,
} from "utils/constants";
import { bufferToUrl } from "utils/functions";

type InternetShortcut = {
  InternetShortcut: {
    BaseURL: string;
    IconFile: string;
    URL: string;
  };
};

const getIconByFileExtension = (extension: string): string => {
  const { icon: extensionIcon = "", process: [defaultProcess = ""] = [] } =
    extension in extensions ? extensions[extension as ExtensionType] : {};

  if (extensionIcon) return `/icons/${extensionIcon}.png`;

  return (
    processDirectory[defaultProcess || DEFAULT_FILE_VIEWER]?.icon ||
    "/icons/unknown.png"
  );
};

const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] =
    extension in extensions
      ? extensions[extension as ExtensionType].process
      : [DEFAULT_FILE_VIEWER];

  return defaultProcess;
};

const getShortcutInfo = (contents: Buffer): FileInfo => {
  const {
    InternetShortcut: { BaseURL: pid = "", IconFile: icon = "", URL: url = "" },
  } = ini.parse(contents.toString()) as InternetShortcut;

  return { icon, pid, url };
};

export const getInfoWithoutExtension = (
  fs: FSModule,
  path: string,
  callback: React.Dispatch<React.SetStateAction<FileInfo>>
): void =>
  fs.stat(path, (_error, stats) => {
    const isDirectory = stats ? stats.isDirectory() : false;

    callback({
      icon: `/icons/${isDirectory ? "folder.png" : "unknown.png"}`,
      pid: isDirectory ? "FileExplorer" : DEFAULT_FILE_VIEWER,
      url: path,
    });
  });

export const getInfoWithExtension = (
  fs: FSModule,
  path: string,
  extension: string,
  callback: React.Dispatch<React.SetStateAction<FileInfo>>
): void => {
  const getInfoByFileExtension = (icon?: string): void =>
    callback({
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      url: path,
    });

  if (extension === SHORTCUT_EXTENSION) {
    fs.readFile(path, (error, contents = EMPTY_BUFFER) => {
      if (error) {
        getInfoByFileExtension();
      } else {
        callback(getShortcutInfo(contents));
      }
    });
  } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
    fs.readFile(path, (error, contents = EMPTY_BUFFER) =>
      getInfoByFileExtension(error ? "/icons/photo.png" : bufferToUrl(contents))
    );
  } else if (extension === ".mp3") {
    fs.readFile(path, (error, contents = EMPTY_BUFFER) =>
      import("music-metadata-browser").then(({ parseBuffer, selectCover }) =>
        parseBuffer(
          contents,
          {
            mimeType: MP3_MIME_TYPE,
            size: contents.length,
          },
          { skipPostHeaders: true }
        ).then(({ common: { picture } = {} }) => {
          const { data: coverPicture } = selectCover(picture) || {};

          getInfoByFileExtension(
            !error && coverPicture
              ? bufferToUrl(coverPicture)
              : "/icons/music.png"
          );
        })
      )
    );
  } else {
    getInfoByFileExtension();
  }
};

export const filterSystemFiles =
  (directory: string) =>
  (file: string): boolean =>
    !SYSTEM_FILES.has(join(directory, file));
