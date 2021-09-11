import type { MotionProps } from "framer-motion";
import { useTheme } from "styled-components";
import {
  MILLISECONDS_IN_SECOND,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";

const useStartMenuTransition = (): MotionProps => {
  const {
    sizes: { startMenu },
  } = useTheme();

  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_MILLISECONDS.START_MENU / MILLISECONDS_IN_SECOND,
      ease: [-0.15, 1, 0, 1],
    },
    variants: {
      active: {
        height: startMenu.size,
        paddingTop: 0,
      },
      initial: {
        height: 0,
        paddingTop: startMenu.size,
      },
    },
  };
};

export default useStartMenuTransition;
