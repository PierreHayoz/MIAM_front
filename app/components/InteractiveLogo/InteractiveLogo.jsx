'use client'

import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

const LiquidPath = ({ normal, liquid, ...props }) => {
  const controls = useAnimation();
  const [isLiquid, setIsLiquid] = useState(false);

  const handleTap = () => {
    setIsLiquid(!isLiquid);
    controls.start({
      d: isLiquid ? normal : liquid,
      scale: [1, 0.7, 0.95, 1],
      rotate: [-2, 2, -1, 0],
      transition: { duration: 0.8, ease: "easeInOut" }
    });
  };

  return (
    <motion.path
      d={normal}
      fill="#231F20"
      animate={controls}
      onTap={handleTap}
      style={{ cursor: "pointer" }}
      {...props}
    />
  );
};

const Logo = () => (
  <svg
    width="1241"
    height="334"
    viewBox="0 0 1241 334"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <LiquidPath
      normal="M514.162 333.015H418.159C413.931 333.015 410.505 329.577 410.505 325.333V104.675C410.505 100.433 413.931 96.9932 418.159 96.9932H514.162C518.39 96.9932 521.816 100.433 521.816 104.675V325.333C521.816 329.577 518.39 333.015 514.162 333.015Z"
      liquid="M126.162 333.015L8.15359 333.015C3.92632 333.015 0.5 329.577 0.5 325.333V104.675C0.5 100.433 3.92632 96.9931 8.15359 96.9931L126.162 96.9936C65.7972 227.909 150.665 172.9 186.421 148.364C195.956 141.821 198.994 144.563 195.072 155.442L133.816 325.334C133.816 329.577 130.389 333.015 126.162 333.015Z"
    />
  </svg>
);

export default Logo;
