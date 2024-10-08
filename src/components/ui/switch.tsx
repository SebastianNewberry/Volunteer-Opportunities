// This code was provided from the creator of aceternity ui (https://www.aceternity.com/components/framer-motion-switch).
// I slightly modified the colors and did some other minor styling modifications but for the most part this entire toggle comes from the creator of aceternity.

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { v4 } from "uuid";
export const Switch = ({
  checked,
  setChecked,
  className,
  specialKey,
}: {
  checked: boolean;
  setChecked: () => void;
  className?: string;
  specialKey: string;
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <form
      className={cn(className, "flex justify-center antialiased items-center")}
    >
      <label
        htmlFor="checkbox"
        className={`h-7  px-1  flex items-center border border-transparent shadow-[inset_0px_0px_12px_rgba(0,0,0,0.25)] rounded-full w-[60px] relative cursor-pointer transition duration-200 ${
          checked ? "bg-organization" : "bg-volunteer"
        }`}
      >
        <motion.div
          initial={{
            width: "20px",
            x: hasInteracted ? (checked ? 0 : 32) : checked ? 32 : 0,
          }}
          animate={
            hasInteracted
              ? {
                  height: ["20px", "10px", "20px", "20px"],
                  width: ["20px", "30px", "20px", "20px"],
                  x: checked ? 32 : 0,
                }
              : { x: checked ? 32 : 0 } // Just position on initial load
          }
          transition={{
            duration: 1,
            delay: 0.1,
          }}
          key={specialKey + String(checked)}
          className={"h-[20px] block rounded-full bg-white shadow-md z-10"}
        ></motion.div>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            setChecked();
            setHasInteracted(true);
          }}
          className="hidden"
          id="checkbox"
        />
      </label>
    </form>
  );
};
