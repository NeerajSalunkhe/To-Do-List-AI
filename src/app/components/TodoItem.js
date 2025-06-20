'use client';
import { useRef } from "react";
import { motion } from "framer-motion";

const TodoItem = ({ id, todo, children }) => {
  const itemRef = useRef(null);

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
