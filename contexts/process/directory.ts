import type { Processes } from "contexts/process/types";
import dynamic from "next/dynamic";

const processDirectory: Processes = {
  FileExplorer: {
    backgroundColor: "#202020",
    Component: dynamic(() => import("components/apps/FileExplorer")),
    icon: "/icons/explorer.png",
    title: "File Explorer",
  },
  Timetable: {
    autoSizing: false,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Timetable")),
    icon: "/icons/timetable.png",
    lockAspectRatio: false,
    title: "Timetable",
    defaultSize: {
      height: 400,
      width: 600,
    },
  },
  Intranet: {
    autoSizing: false,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Intranet")),
    icon: "/icons/intranet.png",
    lockAspectRatio: false,
    title: "Maidnet",
    defaultSize: {
      height: 400,
      width: 500,
    },
  },
  Maids: {
    autoSizing: false,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Maids")),
    icon: "/icons/maids.png",
    lockAspectRatio: false,
    title: "Mad Maids",
    defaultSize: {
      height: 500,
      width: 400,
    },
  },
  Telegram: {
    autoSizing: false,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Telegram")),
    icon: "/icons/telegram.png",
    lockAspectRatio: false,
    title: "Telegram",
    defaultSize: {
      height: 500,
      width: 400,
    },
  },
  Mail: {
    autoSizing: false,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Mail")),
    icon: "/icons/mail.png",
    lockAspectRatio: false,
    title: "Mail",
    defaultSize: {
      height: 500,
      width: 400,
    },
  },
  JSDOS: {
    autoSizing: true,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/JSDOS")),
    icon: "/icons/jsdos.png",
    lockAspectRatio: true,
    title: "js-dos v7",
  },
  MonacoEditor: {
    backgroundColor: "#1E1E1E",
    Component: dynamic(() => import("components/apps/MonacoEditor")),
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/icons/monaco.png",
    title: "Monaco Editor",
  },
  Ruffle: {
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/Ruffle")),
    defaultSize: {
      height: 400,
      width: 550,
    },
    icon: "/icons/ruffle.png",
    title: "Ruffle",
  },
  TinyMCE: {
    backgroundColor: "#FFF",
    Component: dynamic(() => import("components/apps/TinyMCE")),
    defaultSize: {
      height: 400,
      width: 400,
    },
    icon: "/icons/tinymce.png",
    title: "TinyMCE",
  },
  V86: {
    autoSizing: true,
    backgroundColor: "#000",
    Component: dynamic(() => import("components/apps/V86")),
    icon: "/icons/v86.png",
    title: "Virtual x86",
  },
  Webamp: {
    Component: dynamic(() => import("components/apps/Webamp")),
    hasWindow: false,
    icon: "/icons/webamp.png",
    singleton: true,
    title: "Webamp",
  },
};

export default processDirectory;
