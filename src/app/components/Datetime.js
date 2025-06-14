"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Calendar24({ onDateTimeChange }) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState()
  const [time, setTime] = React.useState("10:30:00")

  React.useEffect(() => {
    if (date && time) {
      const [hours, minutes, seconds] = time.split(":").map(Number)
      const fullDate = new Date(date)
      fullDate.setHours(hours || 0)
      fullDate.setMinutes(minutes || 0)
      fullDate.setSeconds(seconds || 0)
      fullDate.setMilliseconds(0)

      if (onDateTimeChange) {
        onDateTimeChange(fullDate) // Send back to parent
      }
    }
  }, [date, time])

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Label htmlFor="date" className="px-1">
          Date
        </Label>
      </div>
      <div className="flex flex-col items-center gap-2">

        <Input
          type="time"
          id="time"
          step="1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        <Label htmlFor="time" className="px-1">
          Time
        </Label>
      </div>
    </div>
  )
}

export default Calendar24
