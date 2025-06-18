'use client';
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const TodoItem = ({ id, todo, children }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: itemRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  return (
    <motion.li
      ref={itemRef}
      layout
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="todo-item w-full mx-auto py-4 md:px-5 px-3 rounded-2xl flex flex-col gap-3 border shadow-md bg-white dark:bg-zinc-800 dark:text-white"
    >
      {children}
    </motion.li>
  );
};

export default TodoItem;
