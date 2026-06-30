/*
import {
  motion,
  useMotionValue,
  useSpring,
  MotionValue,
} from "motion/react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

export type EyeHandle = {
  move: (mouseX: number, mouseY: number) => void;
  reset: () => void;
};

const MAX_DISTANCE = 5;

const Eye = forwardRef<EyeHandle>((_, ref) => {
  const eyeRef = useRef<HTMLDivElement>(null);

  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);

  const x = useSpring(pupilX, {
    stiffness: 350,
    damping: 25,
  });

  const y = useSpring(pupilY, {
    stiffness: 350,
    damping: 25,
  });

  useImperativeHandle(ref, () => ({
    move(mouseX, mouseY) {
      if (!eyeRef.current) return;

      const rect = eyeRef.current.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;

      const distance = Math.hypot(dx, dy);

      if (distance > MAX_DISTANCE) {
        pupilX.set((dx / distance) * MAX_DISTANCE);
        pupilY.set((dy / distance) * MAX_DISTANCE);
      } else {
        pupilX.set(dx);
        pupilY.set(dy);
      }
    },

    reset() {
      pupilX.set(0);
      pupilY.set(0);
    },
  }));

  return (
    <div
      ref={eyeRef}
      className="flex size-6 items-center justify-center rounded-full bg-white"
    >
      <motion.div
        style={{
          x,
          y,
        }}
        className="size-3 rounded-full bg-black"
      />
    </div>
  );
});

Eye.displayName = "Eye";

export default Eye;

import { useRef } from "react";
import { motion } from "motion/react";

import { Button } from "@repo/ui";
import { ThemeToggle } from "./components/ThemeToggle";

import Eye, { EyeHandle } from "./Eye";

const App = () => {
  const leftEye = useRef<EyeHandle>(null);
  const rightEye = useRef<EyeHandle>(null);

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    leftEye.current?.move(e.clientX, e.clientY);
    rightEye.current?.move(e.clientX, e.clientY);
  };

  const resetEyes = () => {
    leftEye.current?.reset();
    rightEye.current?.reset();
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={resetEyes}
      className="bg-background text-foreground flex h-screen items-center justify-center"
    >
      <div className="absolute right-20 top-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial="open"
        whileHover="closed"
        className="relative h-10 w-56 select-none"
      >
        <Button
          variant="briskPrimary"
          className="absolute inset-0 z-10 flex items-center justify-between rounded-xs border-none bg-neutral-700 px-4 text-white"
        >
          <span>HELLO</span>

          <div className="flex gap-2">
            <Eye ref={leftEye} />
            <Eye ref={rightEye} />
          </div>
        </Button>

        <motion.div
          variants={{
            open: {
              rotateZ: -20,
            },
            closed: {
              rotateZ: 0,
            },
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "left bottom",
          }}
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xs bg-neutral-300 text-black shadow-xl"
        >
          Button Component
        </motion.div>
      </motion.div>
    </div>
  );
};

export default App;
*/
