import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export default function NumberAnimation({ start, end, duration }) {
  const [currentValue, setCurrentValue] = useState(start);
  const controls = useAnimation();

  useEffect(() => {
    // controls.start({
    //   children: end,
    //   transition: { duration, type: "spring", stiffness: 100 },
    //   onTimeUpdate: (value) => setCurrentValue(value),
    // });
  }, [controls, end, duration]);

  return (
    <motion.div>
      {currentValue} {/* Adjust decimal places as needed */}
    </motion.div>
  );
}
