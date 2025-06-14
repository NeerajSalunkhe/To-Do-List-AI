"use client"

import React, { useEffect, useState } from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// 📌 Always return 5 AM time
function getScheduledTime(date) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const isToday = today.getTime() === selectedDate.getTime();
  const currentHour = now.getHours();

  if (isToday) {
    if (currentHour < 23) {
      date.setHours(23, 0, 0, 0); // 11:00 PM today
    } else {
      // It's already after 11PM → set to 6AM next day
      date.setDate(date.getDate() + 1);
      date.setHours(6, 0, 0, 0);
    }
  } else {
    // For other days → always set 6:00 AM
    date.setHours(6, 0, 0, 0);
  }
  return date;
}


export function Calendar24({ onDateTimeChange }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("In 2 days")
  const [date, setDate] = useState(parseDate(value) || undefined)
  const [month, setMonth] = useState(date)

  useEffect(() => {
    if (date) {
      const reminderDate = getScheduledTime(date)
      if (onDateTimeChange) {
        onDateTimeChange(reminderDate)
      }
    }
  }, [onDateTimeChange,date])

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Set Reminder
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="e.g., Tomorrow, next Friday"
          className="bg-background pr-10"
          onChange={(e) => {
            setValue(e.target.value)
            const parsed = parseDate(e.target.value)
            if (parsed) {
              const updated = getScheduledTime(parsed)
              setDate(updated)
              setMonth(updated)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
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
                  const updated = getScheduledTime(selectedDate)
                  setDate(updated)
                  setValue(formatDate(updated))
                  setOpen(false)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-muted-foreground px-1 text-sm">
        Your reminder will be sent on{" "}
        <span className="font-medium">{formatDate(date)}</span>{" "}
        at{" "}
        <span className="font-medium">
          {date?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>.
      </div>

    </div>
  )
}

export default Calendar24
