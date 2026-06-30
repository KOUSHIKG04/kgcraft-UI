import { Button } from "@repo/ui";
import { motion } from "motion/react";

/*
If you want the HELLO button itself to trigger the animation
Use useAnimationControls():

import { motion, useAnimationControls } from "motion/react";
const controls = useAnimationControls();

<div className="relative h-10 w-50">
  <Button
    variant="outline"
    className="absolute inset-0 z-10 rounded-sm border-none bg-neutral-700 text-white"
    onMouseEnter={() => controls.start({ rotateZ: 0 })}
    onMouseLeave={() => controls.start({ rotateZ: -20 })}
  >
    HELLO
  </Button>

  <motion.div
    animate={controls}
    initial={{ rotateZ: -20 }}
    transition={{ duration: 0.2 }}
    style={{ transformOrigin: "left bottom" }}
    className="absolute inset-0 z-20 flex items-center justify-center rounded-sm bg-neutral-300"
  >
    Button Component
  </motion.div>
</div>
*/

const ClapTopToBottom = () => {
  return (
    <div>
      <div className="group flex items-center justify-center perspective-[1200] transform-3d">
        <div className="relative h-10 w-50">
          <Button
            variant="outline"
            className="absolute inset-0 rounded-sm border-none bg-neutral-700 text-white"
          ></Button>

          <motion.div
            initial={{ rotateZ: -20 }}
            whileHover={{
              rotateZ: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            style={{
              transformOrigin: "left bottom",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-sm bg-neutral-300 text-black shadow-xl active:scale-98"
          >
            Button Component
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClapTopToBottom;


/*
// import { cn } from "./lib/utils";
import { Button } from "@repo/ui";
import { ThemeToggle } from "./components/ThemeToggle";
import { motion, useMotionValue, useSpring } from "motion/react";

const App = () => {
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);

  const x = useSpring(pupilX, { stiffness: 400, damping: 30 });
  const y = useSpring(pupilY, { stiffness: 400, damping: 30 });

  // const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const eye = e.currentTarget.querySelector(".eye") as HTMLDivElement;

    if (!eye) return;

    const rect = eye.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Maximum movement of pupil
    const radius = 5;

    if (distance > radius) {
      pupilX.set((dx / distance) * radius);
      pupilY.set((dy / distance) * radius);
    } else {
      pupilX.set(dx);
      pupilY.set(dy);
    }
  };

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={() => {
        pupilX.set(0);
        pupilY.set(0);
      }}
      className="bg-background text-foreground relative flex h-screen w-screen items-center justify-center transition-colors duration-300"
    >
      <div className="absolute top-40 right-80">
        <ThemeToggle />
      </div>

      <motion.div
        initial="open"
        whileHover="closed"
        className="relative h-10 w-50 select-none"
        drag={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <Button
          variant="briskPrimary"
          className="absolute inset-0 z-10 flex justify-end gap-1 rounded-xs border-none bg-neutral-700 text-white active:scale-98"
        >
          <div className="eye relative flex size-6 items-center justify-center rounded-full bg-white">
            <motion.div
              style={{ x, y }}
              className="size-5 rounded-full bg-black"
            />
          </div>
          <div className="eye relative flex size-6 items-center justify-center rounded-full bg-white">
            <motion.div
              style={{ x, y }}
              className="size-5 rounded-full bg-black"
            />
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
            // transformOrigin: "0% 100%",
          }}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center rounded-xs bg-neutral-300 text-black shadow-xl active:scale-102"
        >
          Button Component
        </motion.div>
      </motion.div>
    </div>
  );
};

export default App;
*/

