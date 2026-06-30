import { useRef } from "react";
import { Button } from "@repo/ui";
import { ThemeToggle } from "../../components/ThemeToggle";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const MAX_PUPIL_OFFSET = 5;

const SPRING_CONFIG = { stiffness: 350, damping: 25 };

function getPupilOffset(
  eye: HTMLDivElement,
  mouseX: number,
  mouseY: number,
): { x: number; y: number } {
  const rect = eye.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.hypot(dx, dy);

  if (distance > MAX_PUPIL_OFFSET) {
    return {
      x: (dx / distance) * MAX_PUPIL_OFFSET,
      y: (dy / distance) * MAX_PUPIL_OFFSET,
    };
  }

  return { x: dx, y: dy };
}

function Eye({
  eyeRef,
  springX,
  springY,
}: {
  eyeRef: React.RefObject<HTMLDivElement>;
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
}) {
  return (
    <div
      ref={eyeRef}
      className="relative flex size-6 items-center justify-center rounded-full bg-white"
    >
      <motion.div
        style={{ x: springX, y: springY }}
        className="size-3 rounded-full bg-black"
      />
    </div>
  );
}

const RotateEyeOptimised = () => {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const leftX = useMotionValue(0);
  const leftY = useMotionValue(0);

  const rightX = useMotionValue(0);
  const rightY = useMotionValue(0);

  const leftSpringX = useSpring(leftX, SPRING_CONFIG);
  const leftSpringY = useSpring(leftY, SPRING_CONFIG);
  const rightSpringX = useSpring(rightX, SPRING_CONFIG);
  const rightSpringY = useSpring(rightY, SPRING_CONFIG);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leftEyeRef.current) {
      const { x, y } = getPupilOffset(leftEyeRef.current, e.clientX, e.clientY);
      leftX.set(x);
      leftY.set(y);
    }
    if (rightEyeRef.current) {
      const { x, y } = getPupilOffset(
        rightEyeRef.current,
        e.clientX,
        e.clientY,
      );
      rightX.set(x);
      rightY.set(y);
    }
  };

  const resetEyes = () => {
    leftX.set(0);
    leftY.set(0);
    rightX.set(0);
    rightY.set(0);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={resetEyes}
      className="bg-background text-foreground relative flex h-screen w-screen items-center justify-center"
    >
      <div className="absolute top-20 right-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial="open"
        whileHover="closed"
        className="relative h-10 w-56 select-none"
      >
        <Button
          variant="briskSecondary"
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-end rounded-xs border-none bg-neutral-700 px-4 text-white",
          )}
        >
          <div className="flex gap-2">
            <Eye
              eyeRef={leftEyeRef}
              springX={leftSpringX}
              springY={leftSpringY}
            />
            <Eye
              eyeRef={rightEyeRef}
              springX={rightSpringX}
              springY={rightSpringY}
            />
          </div>
        </Button>

        <motion.div
          variants={{
            open: { rotateZ: -20 },
            closed: { rotateZ: 0 },
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{ transformOrigin: "left bottom" }}
          className={cn(
            "border-input text-secondary-foreground after=[''] bg-secondary relative overflow-hidden after:absolute after:-top-5 after:-left-3 after:h-[100px] after:w-[40px] after:-translate-x-20 after:rotate-10 after:bg-neutral-400/22 after:[mask-image:linear-gradient(to_right,transparent,black_40%,black_60%,transparent)] after:transition-all after:duration-1050 hover:after:translate-x-[650%]",
            "transition-scale absolute inset-0 z-20 flex cursor-pointer items-center justify-center rounded-xs bg-neutral-300 text-black shadow-xl duration-100 active:scale-103",
          )}
        >
          Click me !!!
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RotateEyeOptimised;
