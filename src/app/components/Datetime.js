"use client";

import React, { useEffect, useState } from "react";
import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function getScheduledTime(date) {
  const now = new Date();

  // Convert current UTC time to IST (UTC+5:30)
  const istOffsetMinutes = 330; // 5.5 hours
  const istNow = new Date(now.getTime() + istOffsetMinutes * 60 * 1000);

  const currentISTHours = istNow.getUTCHours();
  const currentISTMinutes = istNow.getUTCMinutes();
  const currentISTTotalMinutes = currentISTHours * 60 + currentISTMinutes;

  const selectedDate = new Date(date);
  const todayIST = new Date(now.getTime() + istOffsetMinutes * 60 * 1000);
  todayIST.setUTCHours(0, 0, 0, 0);

  const selectedDateIST = new Date(selectedDate.getTime() + istOffsetMinutes * 60 * 1000);
  selectedDateIST.setUTCHours(0, 0, 0, 0);

  const isToday = todayIST.getTime() === selectedDateIST.getTime();
  const morningThreshold = 7 * 60 + 30; // 7:30 AM in minutes

  if (isToday) {
    if (currentISTTotalMinutes < morningThreshold) {
      date.setHours(7, 30, 0, 0); // Set to 7:30 AM IST today
    } else {
      date.setHours(19, 30, 0, 0); // Set to 7:30 PM IST today
    }
  } else {
    date.setHours(7, 30, 0, 0); // Set to 7:30 AM IST for other days
  }

  return date;
}


export function Calendar24({ onDateTimeChange, userid, todoid, change }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("In 2 days");
  const [date, setDate] = useState(undefined);
  const [month, setMonth] = useState(undefined);
  const [reminderSet, setReminderSet] = useState(false);

  // Fetch reminderAt on mount or when userid, todoid, or change changes
  useEffect(() => {
    let isMounted = true;

    async function fetchReminder() {
      try {
        const res = await fetch("/api/reminderat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid, todoid }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (data?.success && data.reminderAt) {
          const parsed = new Date(data.reminderAt);
          setDate(parsed);
          setMonth(parsed);
          setValue(formatDate(parsed));
          setReminderSet(true);
          onDateTimeChange?.(parsed);
        } else {
          const fallback = parseDate(value);
          if (fallback) {
            const scheduled = getScheduledTime(fallback);
            setDate(scheduled);
            setMonth(scheduled);
            onDateTimeChange?.(scheduled);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reminderAt", err);
      }
    }

    if (userid && todoid) {
      fetchReminder();
    }

    return () => {
      isMounted = false;
    };
  }, [userid, todoid, change]); // kept minimal and stable

  // Only call onDateTimeChange if date changes
  useEffect(() => {
    if (date) {
      onDateTimeChange?.(date);
    }
  }, [date]);

  return (
    <div className="w-full">
      <div className="border-1 mb-1 border-gray-650 shadow-2xl shadow-gray-650">

      </div>
      <div className="flex md:justify-baseline md:items-center  gap-3">
        <div className="relative flex gap-2">
          <Input
            id="date"
            value={value}
            placeholder="e.g., Tomorrow, next Friday"
            className="bg-background pr-10"
            onChange={(e) => {
              const text = e.target.value;
              setValue(text);
              const parsed = parseDate(text);
              if (parsed) {
                const updated = getScheduledTime(parsed);
                setDate(updated);
                setMonth(updated);
                setReminderSet(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date-picker"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                month={month}
                onMonthChange={setMonth}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const updated = getScheduledTime(selectedDate);
                    setDate(updated);
                    setValue(formatDate(updated));
                    setOpen(false);
                    setReminderSet(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={`px-1 text-xs ${reminderSet
            ? "text-green-600 dark:text-green-400 font-medium"
            : "text-muted-foreground"
            }`}
        >
          {reminderSet ? "✅ Reminder is set for " : ""}
          <span className="font-medium">{formatDate(date)}</span> at{" "}
          <span className="font-medium">
            {date?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
          .
        </div>
      </div>
    </div>
  );
}

export default Calendar24;
