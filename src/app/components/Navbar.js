'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Moon, Sun, ClipboardList, CheckSquare, Bell, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Typed from 'typed.js';
import Image from 'next/image';
import { UserButton, useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SignedIn, SignedOut, SignInButton, ClerkLoaded } from "@clerk/nextjs";

const Navbar = () => {
  const { isLoaded, isSignedIn } = useUser();
  const words = [
    { text: "Tasks", icon: <ClipboardList size={20} /> },
    { text: "Completed", icon: <CheckSquare size={20} /> },
    { text: "Reminders", icon: <Bell size={20} /> },
    { text: "Important", icon: <Star size={20} /> },
    { text: "Tasks", icon: <ClipboardList size={20} /> },
    { text: "Completed", icon: <CheckSquare size={20} /> },
    { text: "Reminders", icon: <Bell size={20} /> },
    { text: "Important", icon: <Star size={20} /> },
  ];

  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(4);
    }
  }, []);

  useEffect(() => {
    fetch('/todolist.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 10,
        duration: 0.6,
      }}
      className="w-full flex justify-between items-center md:px-40 px-1 bg-white/30 dark:bg-black/30 shadow-md dark:shadow-gray-900 sticky top-0 z-20 backdrop-blur-xs"
    >
      {/* Logo + Title */}
      <div className="flex md:gap-3 gap-0 min-w-[200px]">
        {animationData && (
          <Lottie
            className="codejson w-15 h-15 rounded-full object-contain"
            animationData={animationData}
            loop={true}
            lottieRef={lottieRef}
          />
        )}
        <h1>
          <span className="slide md:mt-0 mt-0 my-0 mb-0 fixed md:-top-6 -top-3 md:pt-4 pt-7">
            <span className="wrapper">
              {words.map((word) => (
                <span
                  key={uuidv4()}
                  className="flex items-center md:gap-3 gap-0 md:my-3 my-3"
                >
                  <span className="text-3xl font-bold">{word.text}</span>
                  <span className="xl:w-10 xl:h-10 md:w-10 md:h-10 w-7 h-7 md:p-1 p-0 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center">
                    {word.icon}
                  </span>
                </span>
              ))}
            </span>
          </span>
        </h1>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <div
          onClick={toggleTheme}
          className="w-14 h-7 rounded-full flex items-center px-1 cursor-pointer relative bg-gray-300 dark:bg-gray-700 transition-colors duration-300"
        >
          <Sun className="h-4 w-4 text-yellow-500 absolute left-1 top-1/2 transform -translate-y-1/2" />
          <Moon className="h-4 w-4 text-white absolute right-1 top-1/2 transform -translate-y-1/2" />
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-md z-10"
            animate={{ x: theme === 'dark' ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
          />
        </div>

        <ClerkLoaded>
          <SignedOut>
            <SignInButton>
              <Button variant="outline" className="relative cursor-pointer p-2">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className='glowblue1 rounded-full flex justify-center items-center'>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className='text-center'>Your Profile</div>
              </HoverCardContent>
            </HoverCard>
          </SignedIn>
        </ClerkLoaded>
      </div>
    </motion.header>
  );
};

export default Navbar;
