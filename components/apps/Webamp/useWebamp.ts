import {
  BASE_WEBAMP_OPTIONS,
  cleanBufferOnSkinLoad,
  closeEqualizer,
  getWebampElement,
  MAIN_WINDOW,
  parseTrack,
  updateWebampPosition,
} from "components/apps/Webamp/functions";
import type { WebampCI } from "components/apps/Webamp/types";
import useWindowActions from "components/system/Window/Titlebar/useWindowActions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { basename, extname } from "path";
import { useState } from "react";
import { useTheme } from "styled-components";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { bufferToUrl } from "utils/functions";
import type { Options } from "webamp";

type Webamp = {
  loadWebamp: (
    containerElement: HTMLDivElement | null,
    url: string,
    file?: Buffer
  ) => void;
  webampCI?: WebampCI;
};

const useWebamp = (id: string): Webamp => {
  const { onClose, onMinimize } = useWindowActions(id);
  const { setWindowStates, windowStates: { [id]: windowState } = {} } =
    useSession();
  const { position } = windowState || {};
  const {
    sizes: {
      taskbar: { height: taskbarHeight },
    },
  } = useTheme();
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { componentWindow } = process || {};
  const [webampCI, setWebampCI] = useState<WebampCI>();
  const loadWebamp = (
    containerElement: HTMLDivElement | null,
    url: string,
    file?: Buffer
  ): void => {
    if (containerElement && window.Webamp && !webampCI) {
      const runWebamp = (options?: Options): void => {
        const webamp = new window.Webamp({
          ...BASE_WEBAMP_OPTIONS,
          ...options,
        }) as WebampCI;
        const setupElements = (): void => {
          const webampElement = getWebampElement();

          if (webampElement) {
            const mainWindow =
              webampElement.querySelector<HTMLDivElement>(MAIN_WINDOW);

            if (process && !componentWindow && mainWindow) {
              linkElement(id, "componentWindow", containerElement);
              linkElement(id, "peekElement", mainWindow);
            }

            containerElement.appendChild(webampElement);
          }
        };
        const subscriptions = [
          webamp.onWillClose((cancel) => {
            cancel();

            const mainWindow =
              getWebampElement()?.querySelector<HTMLDivElement>(MAIN_WINDOW);
            const { x = 0, y = 0 } = mainWindow?.getBoundingClientRect() || {};

            onClose();
            setWindowStates((currentWindowStates) => ({
              ...currentWindowStates,
              [id]: {
                position: { x, y },
              },
            }));

            setTimeout(() => {
              subscriptions.forEach((unsubscribe) => unsubscribe());
              webamp.close();
            }, TRANSITIONS_IN_MILLISECONDS.WINDOW);
          }),
          webamp.onMinimize(() => onMinimize()),
        ];

        if (options?.initialSkin?.url) {
          cleanBufferOnSkinLoad(webamp, options.initialSkin.url);
        }

        webamp.renderWhenReady(containerElement).then(() => {
          closeEqualizer(webamp);
          updateWebampPosition(webamp, taskbarHeight, position);
          setupElements();

          if (options?.initialTracks) {
            webamp.play();
          }
        });

        setWebampCI(webamp);
      };

      if (file) {
        const extension = extname(url);

        if (extension === ".mp3") {
          parseTrack(file, basename(url)).then((track) =>
            runWebamp({ initialTracks: [track] })
          );
        } else if (extension === ".wsz") {
          runWebamp({ initialSkin: { url: bufferToUrl(file) } });
        } else {
          runWebamp();
        }
      } else {
        runWebamp();
      }
    }
  };

  return {
    loadWebamp,
    webampCI,
  };
};

export default useWebamp;
