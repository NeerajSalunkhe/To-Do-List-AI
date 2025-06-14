'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Typed from 'typed.js';
import Image from 'next/image';
import { UserButton, useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';

import {
    ClipboardList,
    CheckSquare,
    Bell,
    Star,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Lottie from 'lottie-react';
import { useRef, useState, useEffect } from 'react';
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
    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(4); // 🔥 2x speed
        }
    }, []);
    useEffect(() => {
        fetch('/todolist.json')
            .then((res) => res.json())
            .then(setAnimationData);
    }, []);
    const { setTheme } = useTheme();

    const authBtnStyle =
        'border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground text-sm px-3 py-2 rounded-lg dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-colors';

    return (
        <header className="w-full flex justify-between  items-center md:px-40 px-1 bg-white/30 dark:bg-black/30 shadow-md dark:shadow-gray-900 sticky top-0 z-10 backdrop-blur-xs">
            {/* Logo + Title */}
            {/* Logo + Title */}
            <div className="flex md:gap-3 gap-0 min-w-[200px]">
                <Lottie
                    className={`codejson 'w-25 h-25 rounded-full object-contain`}
                    animationData={animationData}
                    loop={true}
                    lottieRef={lottieRef}
                />
                {/* <Image
                    src="/to-do-list.gif"
                    alt="To-Do List"
                    width={25}
                    height={25}
                    className="h-25 w-25 object-contain dark:invert-100"
                /> */}
                <h1>
                    <span className="slide md:mt-1 mt-6 my-2 mb-0">
                        <span className="wrapper">
                            {words.map((word) => (
                                <span
                                    key={uuidv4()}
                                    className="flex items-center md:gap-3 gap-0 md:my-5 my-3"
                                >
                                    <span className='text-3xl font-bold'>{word.text}</span>
                                    <span className="xl:w-10 xl:h-10 md:w-10 md:h-10 w-7 h-7 md:p-2 p-1 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center">
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="relative cursor-pointer">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ClerkLoaded>
                    <SignedOut>
                        <SignInButton>
                            <Button variant="outline" className="relative cursor-pointer p-2">Sign In</Button>
                        </SignInButton>
                    </SignedOut>

                    {isLoaded && isSignedIn && (
                        <div className='glowblue1 rounded-full flex justify-center items-center'>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    )}
                </ClerkLoaded>
            </div>
        </header>
    );
};

export default Navbar;
