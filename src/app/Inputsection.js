// Enhanced InputSection.jsx with GSAP + Framer Motion + CopilotKit
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Pencil, Trash2, Check, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { CopilotPopup } from '@copilotkit/react-ui';
import { useCopilotAction } from '@copilotkit/react-core';
import gsap from 'gsap';
import { Skeleton } from '@/components/ui/skeleton';
import { Cursor, set } from 'mongoose';
import { useUser } from '@clerk/nextjs';
import Calendar24 from './components/Datetime';
import { ToastContainer, toast } from 'react-toastify';
// import { toast } from 'react-hot-toast';
import { Loader2Icon } from "lucide-react";
import { CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import NProgress from 'nprogress';
import { showWhatsAppConnectToast } from './components/showWhatsAppConnectToast';

// import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { motion } from "framer-motion";
gsap.registerPlugin(ScrollTrigger);
const FILTERS = {
    ACTIVE: 'active',
    FINISHED: 'finished',
    ALL: 'all',
};

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import TodoItem from './components/TodoItem';
const InputSection = () => {
    const { isSignedIn, userId } = useAuth();
    const { user, isLoaded } = useUser();
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [filter, setFilter] = useState(FILTERS.ACTIVE);
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [setting, setSetting] = useState(false)
    const [joined, setJoined] = useState(false)
    const [loadingjd, setLoadingjd] = useState(false);
    const [settingid, setSettingid] = useState('')
    const [change, setChange] = useState(false)
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    const handlereset = (async () => {
        if (!userId) return;
        setLoadingjd(true);
        NProgress.start();

        try {
            const res = await fetch(`/api/reset/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) {
                setJoined(false);
                toast.success('Reset Subcription Succesfully');
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to connect. Please try again.");
        } finally {
            setLoadingjd(false);
            NProgress.done();
        }
    })
    useEffect(() => {
        if (!isSignedIn) setJoined(false);
        NProgress.start();
        const checkWhatsAppJoinStatus = async () => {
            try {
                const res = await fetch(`/api/checkwa/${userId}`);
                const data = await res.json();
                if (data?.joined) {
                    setJoined(true);
                } else {
                    setJoined(false);
                }
            } catch (err) {
                console.error("Failed to check WhatsApp join status:", err);
            } finally {
                NProgress.done();
            }
        };
        if (userId) {
            checkWhatsAppJoinStatus();
        }
        else setJoined(false);
    }, [userId, isSignedIn]);
    const openWhatsApp = () => {
        const joinCode = "join stranger-said"; // replace with your Twilio sandbox code
        const waLink = `https://api.whatsapp.com/send?phone=14155238886&text=${encodeURIComponent(joinCode)}`;
        window.open(waLink, "_blank");
        toast(({ closeToast }) => (
            <div
                style={{
                    padding: '20px',
                    maxWidth: '360px',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#1f2937', // dark grey
                    color: '#f9fafb', // near-white
                    border: '1px solid #374151',
                    borderRadius: '16px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <CheckCircle size={22} color="#f9fafb" style={{ marginRight: '8px' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                        WhatsApp Setup Almost Done
                    </h2>
                </div>

                <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '8px' }}>
                    To enable WhatsApp reminders, please send the message below in your Twilio chat:
                </p>

                <div
                    style={{
                        backgroundColor: '#374151',
                        padding: '10px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#f3f4f6',
                        marginBottom: '12px',
                        textAlign: 'center',
                    }}
                >
                    join stranger****
                </div>

                <p
                    style={{
                        fontSize: '13px',
                        backgroundColor: '#111827',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        color: '#facc15', // subtle yellow/white for emphasis
                        fontWeight: 600,
                        border: '1px dashed #4b5563',
                    }}
                >
                    ⚠️ Your WhatsApp subscription will automatically expire after <strong style={{ color: '#ffffff' }}>24 hours</strong> unless confirmed — reminders will stop working after that.
                </p>

                <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                    Once done, please confirm below:
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => {
                            confirmJoin();
                            closeToast();
                        }}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#374151',
                            color: '#f9fafb',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <CheckCircle size={18} color="#f9fafb" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {`Yes, I’ve Done It`}
                    </button>
                    <button
                        onClick={closeToast}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#111827',
                            color: '#d1d5db',
                            fontWeight: 600,
                            border: '1px solid #4b5563',
                            borderRadius: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <XCircle size={18} color="#d1d5db" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Not Yet
                    </button>
                </div>
            </div>
        ), {
            position: 'top-right',
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
        });


    };
    const confirmJoin = async () => {
        setLoadingjd(true);
        NProgress.start();

        try {
            const res = await fetch(`/api/confirm-joined/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (data.success) {
                setJoined(true);
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to connect. Please try again.");
        } finally {
            setLoadingjd(false);
            NProgress.done();
        }
    };
    const toastShownRef = useRef(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_GLOBAL_URI}/api/send-whatsapp-reminders`)
            .then(res => res.json())
            .then(data => {
                console.log('✅ Reminder status:', data);
                if (!data.success && data.error === 'daily_limit_exceeded') {
                    if (!toastShownRef.current) {
                        toast.info(
                            ({ closeToast }) => (
                                <div className="flex items-start gap-4 p-4 rounded-xl shadow-md border border-gray-300 bg-white w-full max-w-md">
                                    <div className="text-black text-xl">⚠️</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-black">Reminder Limit Reached</p>
                                        <p className="text-sm text-gray-600">
                                            You’ve reached your daily reminder limit. Try again tomorrow.
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeToast}
                                        className="ml-2 text-sm px-3 py-1 rounded-md bg-black text-white hover:bg-gray-800 transition"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            ),
                            {
                                autoClose: false,
                                closeOnClick: false,
                                draggable: true,
                                closeButton: false,
                                position: 'top-right',
                            }
                        );
                        toastShownRef.current = true; // ✅ mark toast as shown
                    }
                }
            })
            .catch(err => {
                console.error('❌ Reminder error:', err);
            });
    }, []);



    useEffect(() => {
        if (!userId) return;
        const interval = setInterval(() => {
            fetch(`${process.env.NEXT_PUBLIC_GLOBAL_URI}/api/checkwa/${userId}`)
                .then(res => res.json())
                .then(data => console.log('✅ Reminder status:', data))
                .catch(err => console.error('❌ Reminder error:', err));
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userId]);


    useEffect(() => {
        const updatePhone = async () => {
            if (isLoaded && user && isSignedIn) {
                const userPhone = user.phoneNumbers?.[0]?.phoneNumber || '';
                const userEmail=user?.primaryEmailAddress?.emailAddress||' ';
                setPhone(userPhone);
                try {
                    const res = await fetch(`/api/updphone/${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: userPhone , email:userEmail}),
                    });
                    const json = await res.json();
                    if (json.success) {
                        setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                    }
                } catch (e) {
                    console.error('Edit error:', e);
                }
            }
        };
        updatePhone();
    }, [isLoaded, user, isSignedIn, userId]);



    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true); // Start loading

            const storedFilter = localStorage.getItem('guest_filter');
            if (storedFilter) setFilter(storedFilter);

            if (isSignedIn) {
                NProgress.start();
                try {
                    const res = await fetch(`/api/give/${userId}`);
                    const json = await res.json();
                    if (json.success) {
                        setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                    }
                } catch (e) {
                    console.error('Fetch error:', e);
                } finally {
                    NProgress.done();
                }
            } else {
                NProgress.start();

                try {
                    const stored = localStorage.getItem('guest_todos');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const fixed = parsed.map((t) => ({
                            id: typeof t.id === 'string' && t.id.trim() !== '' ? t.id : uuidv4(),
                            text: t.text,
                            done: !!t.done,
                            star: !!t.star,
                        }));
                        setTodos(Array.isArray(fixed) ? fixed : []);
                    }
                } catch (e) {
                    console.error('LocalStorage parse error:', e);
                } finally {
                    NProgress.done();
                }
            }

            setLoading(false); // Stop loading
        };
        load();
    }, [isSignedIn, userId]);


    useEffect(() => {
        localStorage.setItem('guest_filter', filter);
        if (!isSignedIn) {
            try {
                localStorage.setItem('guest_todos', JSON.stringify(todos));
            } catch (e) {
                console.error('LocalStorage write error:', e);
            }
        }
    }, [todos, filter, isSignedIn]);

    // --- CopilotKit Actions ---
    useCopilotAction({
        name: 'addTodoItem',
        description: 'Add a new todo item',
        parameters: [{ name: 'todoText', type: 'string', required: true }],
        handler: async ({ todoText }) => {
            const newTodo = { text: todoText, done: false, star: false };
            setTodos((prev) => [
                ...prev,
                isSignedIn ? { ...newTodo, todo_id: uuidv4() } : { ...newTodo, id: uuidv4() },
            ]);
        },
    });

    useCopilotAction({
        name: 'addMultipleTodos',
        description: 'Add multiple todos at once',
        parameters: [{ name: 'todoTexts', type: 'string[]', required: true }],
        handler: async ({ todoTexts }) => {
            const newTodos = todoTexts.map((text) =>
                isSignedIn ? { todo_id: uuidv4(), text, done: false, star: false } : { id: uuidv4(), text, done: false, star: false }
            );
            setTodos((prev) => [...prev, ...newTodos]);
        },
    });

    useCopilotAction({
        name: 'deleteTodoItem',
        description: 'Delete a todo item by ID',
        parameters: [{ name: 'todoId', type: 'string', required: true }],
        handler: async ({ todoId }) => {
            await handleDelete(todoId);
        },
    });

    useCopilotAction({
        name: 'deleteAllTodos',
        description: 'Delete all todos',
        parameters: [],
        handler: async () => {
            setTodos([]);
        },
    });

    useCopilotAction({
        name: 'editTodoItem',
        description: 'Edit a todo item by ID with new text',
        parameters: [
            { name: 'todoId', type: 'string', required: true },
            { name: 'newText', type: 'string', required: true },
        ],
        handler: async ({ todoId, newText }) => {
            setTodos((prev) =>
                prev.map((t) => {
                    const id = isSignedIn ? t.todo_id : t.id;
                    if (id === todoId) {
                        return { ...t, text: newText };
                    }
                    return t;
                })
            );
        },
    });

    useCopilotAction({
        name: 'markAllDone',
        description: 'Mark all todos as done',
        parameters: [],
        handler: async () => {
            setTodos((prev) => prev.map((t) => ({ ...t, done: true })));
        },
    });

    useCopilotAction({
        name: 'setFilter',
        description: 'Change the current todo filter (all, active, finished)',
        parameters: [{ name: 'filterType', type: 'string', required: true }],
        handler: async ({ filterType }) => {
            if (Object.values(FILTERS).includes(filterType)) {
                setFilter(filterType);
            }
        },
    });

    // === Star Toggle ===
    const toggleStar = async (id) => {
        setTodos((prev) =>
            prev.map((t) => {
                const tid = isSignedIn ? t.todo_id : t.id;
                if (tid === id) {
                    return { ...t, star: !t.star };
                }
                return t;
            })
        );

        if (isSignedIn) {
            const targetTodo = todos.find((t) => (t.todo_id === id));
            if (!targetTodo) return;

            const updatedStar = !targetTodo.star;
            NProgress.start();

            try {
                const res = await fetch(`/api/edit/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        todo_id: id,
                        star: updatedStar,
                    }),
                });

                const json = await res.json();
                if (json.success) {
                    setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                }
            } catch (e) {
                console.error('Star toggle error:', e);
            } finally {
                NProgress.done();
            }
        }
    };


    const handleAddTodo = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        if (isSignedIn) {
            const newTodo = { todo_id: uuidv4(), text: trimmed, done: false, star: false };
            NProgress.start();

            try {
                const res = await fetch(`/api/add/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ todos: [newTodo], userid: userId }),
                });
                const json = await res.json();
                if (json.success) {
                    setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                }
            } catch (e) {
                console.error('Add error:', e);
            }
            finally {
                NProgress.done();
            }
        } else {
            const newTodo = { id: uuidv4(), text: trimmed, done: false, star: false };
            setTodos((prev) => [...prev, newTodo]);
        }
        setInput('');
    };

    const handleDelete = async (id) => {
        if (isSignedIn) {
            NProgress.start();

            try {
                const res = await fetch(`/api/delete/${userId}?key=${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (json.success) {
                    setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                }
            } catch (e) {
                console.error('Delete error:', e);
            } finally {
                NProgress.done();
            }
        } else {
            setTodos((prev) => prev.filter((t) => t.id !== id));
        }

        if (editingId === id) {
            setEditingId(null);
            setEditingText('');
        }
    };



    const saveEdit = async () => {
        if (!editingText.trim()) return;

        if (isSignedIn) {
            NProgress.start();
            try {
                const res = await fetch(`/api/edit/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ todo_id: editingId, text: editingText.trim() }),
                });
                const json = await res.json();
                if (json.success) {
                    setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                }
            } catch (e) {
                console.error('Edit error:', e);
            } finally {
                NProgress.done();
            }
        } else {
            setTodos((prev) =>
                prev.map((t) => (t.id === editingId ? { ...t, text: editingText.trim() } : t))
            );
        }

        setEditingId(null);
        setEditingText('');
    };

    const updateReminder = async (id, dateTime) => {
        // console.log('click');
        // console.log(res);
        console.log(id,dateTime);
        if (!joined) {
            showWhatsAppConnectToast(openWhatsApp);
        }
        else {
            if (!isSignedIn) return;
            setSetting(true);
            setSettingid(id);
            NProgress.start();

            try {
                const res = await fetch(`/api/remedit/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        todo_id: id,
                        reminderAt: new Date(dateTime).toISOString(),
                        reminderSent: false,
                        reminderSentemail: false,
                    }),
                });
                if (!res.ok) {
                    console.error("Failed to update reminder:", await res.text());
                } else {
                    const json = await res.json();
                    console.log("Reminder updated:", json);
                    const formattedDateTime = dateTime.toLocaleString('en-IN', options);
                    toast.success(
                        <div>
                            <strong>Reminder Set!</strong>
                            <p style={{ margin: 0, fontSize: '0.9em' }}>
                                {`We'll notify you by SMS on ${formattedDateTime}.`}
                            </p>
                        </div>,
                        {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        }
                    );
                    setSetting(false);
                    setSettingid('');
                }
            } catch (err) {
                toast.error("Error updating reminder:");
                set(setting(false));
                setSettingid('');
            } finally {
                NProgress.done();
                setChange(!change);
                setSelectedDateTime(null);
            }
        }
    };


    const toggleDone = async (id) => {
        if (isSignedIn) {
            NProgress.start();
            try {

                const todo = todos.find((t) => t.todo_id === id);
                const res = await fetch(`/api/edit/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ todo_id: id, done: !todo.done }),
                });
                const json = await res.json();
                if (json.success) {
                    setTodos(Array.isArray(json.data.todos) ? json.data.todos : []);
                }
            } catch (e) {
                console.error('Toggle error:', e);
            } finally {
                NProgress.done();
            }
        } else {
            setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
        }
    };

    const startEditing = (id) => {
        const todo = todos.find((t) => (isSignedIn ? t.todo_id === id : t.id === id));
        if (todo) {
            setEditingId(id);
            setEditingText(todo.text);
        }
    };

    const handleEnterKey = (e) => {
        if (e.key === 'Enter') handleAddTodo();
    };

    const filteredTodos = todos
        .filter((todo) => {
            if (filter === FILTERS.ALL) return true;
            if (filter === FILTERS.ACTIVE) return !todo.done;
            return todo.done;
        })
        .sort((a, b) => (b.star === true) - (a.star === true)); // Starred at top

    return (
        <>
            <motion.section
                initial={{ y: 100, opacity: 0 }}     // Start below
                animate={{ y: 0, opacity: 1 }}       // Move to original position
                transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 10,
                    duration: 0.6,
                }}
                className="w-full flex justify-between items-center md:px-40 px-1 bg-white/30 dark:bg-black/30 shadow-md dark:shadow-gray-900 sticky top-0 z-10 backdrop-blur-xs"
            >
                <section ref={containerRef} className="w-full h-full min-h-screen max-w-4xl mx-auto mt-12 px-4 pb-25">
                    <motion.div
                        initial={{ y: -200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 10,
                            duration: 0.6,
                        }}
                        className="flex flex-col sm:flex-row gap-4 items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleEnterKey}
                            placeholder="What do you need to get done?"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 shadow-sm focus:ring-2 focus:ring-purple-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                        />
                        <Button onClick={handleAddTodo} className="transition-transform hover:scale-105 cursor-pointer">
                            <PlusCircle className="w-4 h-4 mr-1" /> Add Todo
                        </Button>
                    </motion.div>
                    <motion.div
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 12,
                            duration: 0.6,
                        }}
                    >
                        {!isSignedIn && (
                            <div className="mt-5 flex justify-center italic text-gray-500">
                                Sign In to Explore New Features!
                            </div>
                        )}
                    </motion.div>
                    <div className='mt-8 flex md:flex-row flex-col justify-between md:gap-1 md:justify-between items-center gap-5'>
                        <motion.div
                            initial={{ x: -200, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 12,
                                duration: 0.6,
                            }}
                        >
                            <div>
                                {isSignedIn && (
                                    <>
                                        {joined ? (
                                            <div className='flex justify-center gap-2'>
                                                <Button variant="secondary" className="">✅ Connected To WhatsApp</Button>
                                                {
                                                    loadingjd ? <Button size="sm" disabled className="cursor-pointer">
                                                        <Loader2Icon className="animate-spin mr-2" />
                                                        Please wait...
                                                    </Button> : <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <Button variant="secondary" className="cursor-pointer" onClick={handlereset}>
                                                                Reset
                                                            </Button>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-72 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="font-medium text-foreground">Reset WhatsApp Reminder</p>
                                                                <p className="text-muted-foreground">
                                                                    If you click this, your current WhatsApp subscription will end.
                                                                    You won’t receive any more reminders until you re-enable it.
                                                                </p>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                }
                                            </div>
                                        ) : loadingjd ? (
                                            <Button size="sm" disabled className="cursor-pointer">
                                                <Loader2Icon className="animate-spin mr-2" />
                                                Please wait...
                                            </Button>
                                        ) : (
                                            <>
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <Button onClick={openWhatsApp} className="cursor-pointer">
                                                            Set up WhatsApp Reminders
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-80 rounded-xl shadow-lg p-4 bg-background border">
                                                        <div className="flex flex-col gap-2">
                                                            <h4 className="text-lg font-semibold text-primary">Enable WhatsApp Reminders 📱</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive a WhatsApp message on the day you’ve scheduled your reminder. Stay organized with a simple click.
                                                            </p>
                                                            <ul className="text-sm text-foreground list-disc pl-4">
                                                                <li>Message sent on your chosen day</li>
                                                                <li>No app installation needed</li>
                                                            </ul>
                                                            <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                                                                Works only if you click on <span className="text-blue-600 font-medium">Set up WhatsApp Reminders</span> to enable.
                                                            </div>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ x: 200, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 12,
                                duration: 0.6,
                            }}
                        >
                            <div className="flex gap-2 md:justify-end justify-center">
                                {Object.entries(FILTERS).map(([key, val]) => (
                                    <HoverCard key={uuidv4()}>
                                        <HoverCardTrigger asChild>
                                            <Button
                                                key={uuidv4()}
                                                onClick={() => setFilter(val)}
                                                variant={filter === val ? 'default' : 'outline'}
                                                className="transition-all duration-300 capitalize cursor-pointer"
                                            >
                                                {val}
                                            </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-64 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium text-foreground">Filter: <span className="capitalize">{val}</span></p>
                                                <p className="text-muted-foreground">
                                                    Click this to update the list according to this filter.
                                                </p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>

                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* <div className="flex flex-wrap items-center justify-center mt-7 gap-2 md:flex-row">
                    
                </div> */}

                    <ul className="mt-8 space-y-3 ">
                        <AnimatePresence>
                            {!filteredTodos.length && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-center"
                                >
                                    <Image width={40} height={49} src="/empty.svg" alt="No todos" className="w-40 h-40" />
                                </motion.div>
                            )}

                            {loading ? (
                                <div className="flex justify-center items-centerr">
                                    <div className="flex flex-col space-y-3">
                                        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                filteredTodos.map((todo) => {
                                    const id = isSignedIn ? todo.todo_id : todo.id || uuidv4();
                                    return (
                                        <TodoItem key={todo.todo_id} id={todo.todo_id} todo={todo}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <Checkbox
                                                                checked={todo.done}
                                                                onCheckedChange={() => toggleDone(id)}
                                                                className="mt-1 transition-transform hover:scale-110 cursor-pointer"
                                                            />
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-64 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="font-medium text-foreground">Mark as Done</p>
                                                                <p className="text-muted-foreground">
                                                                    Tick this to mark the task as completed.
                                                                    It will move to <strong>All</strong> and <strong>Finished</strong> filters.
                                                                </p>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                    {editingId === id ? (
                                                        <div className="flex flex-1 gap-2">
                                                            <input
                                                                type="text"
                                                                value={editingText}
                                                                onChange={(e) => setEditingText(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                                className="w-full px-3 py-2 rounded-md text-sm border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-600"
                                                                autoFocus
                                                            />
                                                            <HoverCard>
                                                                <HoverCardTrigger asChild>
                                                                    <Button size="sm" onClick={saveEdit} className="cursor-pointer">
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                </HoverCardTrigger>
                                                                <HoverCardContent className="w-48 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                                    <div className="flex flex-col gap-1">
                                                                        <p className="font-medium text-foreground">Save Changes</p>
                                                                        <p className="text-muted-foreground">
                                                                            Click here to save the updated task.
                                                                        </p>
                                                                    </div>
                                                                </HoverCardContent>
                                                            </HoverCard>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className={classNames(
                                                                'flex-1 break-words whitespace-pre-wrap text-base overflow-hidden',
                                                                todo.done && 'line-through opacity-60'
                                                            )}
                                                        >
                                                            {todo.text}
                                                        </span>
                                                    )}
                                                </div>

                                                {editingId !== id && (
                                                    <div className="flex items-center gap-2">
                                                        <HoverCard>
                                                            <HoverCardTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="hover:bg-yellow-100 dark:hover:bg-yellow-900 cursor-pointer"
                                                                    onClick={() => toggleStar(id)}
                                                                >
                                                                    <Star
                                                                        className="w-5 h-5"
                                                                        color={todo.star ? 'gold' : 'gray'}
                                                                        fill={todo.star ? 'gold' : 'none'}
                                                                    />
                                                                </Button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-52 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="font-medium text-amber-300">
                                                                        {todo.star ? 'Unmark Important' : 'Mark as Important'}
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        {todo.star
                                                                            ? 'Click to remove from important list.'
                                                                            : 'Click to highlight this task as important.'}
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                        <HoverCard>
                                                            <HoverCardTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    onClick={() => startEditing(id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-52 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="font-medium text-foreground">Edit Todo</p>
                                                                    <p className="text-muted-foreground">
                                                                        Click here to modify the text of this task.
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>
                                                        <HoverCard>
                                                            <HoverCardTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-60 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="font-medium text-red-600">Delete Todo</p>
                                                                    <p className="text-muted-foreground">
                                                                        Click here to permanently delete this task. This action cannot be undone.
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                    </div>
                                                )}
                                            </div>

                                            {isSignedIn && (
                                                <div className="mt-1 flex items-baseline justify-end gap-3">
                                                    <Calendar24
                                                        userid={user?.id}               // pass current logged-in user's ID
                                                        todoid={id}         // pass the specific todo ID
                                                        onDateTimeChange={(dateTime) => setSelectedDateTime(dateTime)}
                                                        
                                                        change={change}
                                                    />
                                                    {setting && settingid === id ? (
                                                        <Button size="sm" disabled className="cursor-pointer">
                                                            <Loader2Icon className="animate-spin" />
                                                            Please wait
                                                        </Button>
                                                    ) : (
                                                        <HoverCard>
                                                            <HoverCardTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        if (selectedDateTime) updateReminder(id, selectedDateTime);

                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    Set
                                                                </Button>
                                                            </HoverCardTrigger>
                                                            <HoverCardContent className="w-56 p-3 rounded-xl shadow-lg bg-background border text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="font-medium text-foreground">Set Reminder</p>
                                                                    <p className="text-muted-foreground">
                                                                        Click here to confirm and schedule a WhatsApp reminder for the selected date.
                                                                    </p>
                                                                </div>
                                                            </HoverCardContent>
                                                        </HoverCard>

                                                    )}
                                                </div>
                                            )}

                                        </TodoItem>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </ul>
                </section>

            </motion.section>
            <CopilotPopup
                instructions="You are assisting the user as best as you can. Answer in the best way possible given the data you have."
                labels={{ title: 'Popup Assistant', initial: 'Need any help?' }}
            />
            <ToastContainer />
        </>
    );
};

export default InputSection;
