"use client"

import { Check, Pencil, RotateCcw, X, Trash2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Habit = {
  id: string
  name: string
  completed: ("completed" | "skipped" | false)[]
}

function NewHabitRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [newHabitName, setNewHabitName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleAdd = () => {
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim())
      setNewHabitName("")
    }
  }

  return (
    <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 mb-4 items-center">
      <div className="flex items-center">
        <Input
          ref={inputRef}
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit name"
          className="h-8 text-sm mr-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd()
          }}
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
      {Array(7)
        .fill(null)
        .map((_, index) => (
          <div key={index} className="flex justify-center">
            <div className="w-6 h-6 rounded border-2 border-gray-200 opacity-50" />
          </div>
        ))}
    </div>
  )
}

export default function HabitTracker() {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editMode, setEditMode] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [habits, setHabits] = useState<Habit[]>([])
  const [habitsInit, setHabitsInit] =  useState<boolean>(false)

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    } else {
      setHabits([
        { id: "1", name: "sleep before 2", completed: Array(7).fill(false) },
        { id: "2", name: "journal", completed: Array(7).fill(false) },
        { id: "3", name: "gym", completed: Array(7).fill(false) },
        { id: "4", name: "write", completed: Array(7).fill(false) },
        { id: "5", name: "draw", completed: Array(7).fill(false) },
      ])
    }
    setHabitsInit(true)
  }, [])

  useEffect(() => {
    if (habitsInit) {
    localStorage.setItem("habits", JSON.stringify(habits))
    }
  }, [habits])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }))
    }

    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const currentDay = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  const currentDayIndex = days.indexOf(currentDay)
  const remainingTasks = habits.filter((habit) => habit.completed[currentDayIndex] === false).length

  const toggleHabit = (habitId: string, dayIndex: number) => {
    if (editMode) return // Prevent toggling in edit mode
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const newCompleted = [...habit.completed]
          if (newCompleted[dayIndex] === false) {
            newCompleted[dayIndex] = "completed"
          } else if (newCompleted[dayIndex] === "completed") {
            newCompleted[dayIndex] = "skipped"
          } else {
            newCompleted[dayIndex] = false
          }
          return { ...habit, completed: newCompleted }
        }
        return habit
      }),
    )
  }

  const resetHabits = () => {
    setHabits(
      habits.map((habit) => ({
        ...habit,
        completed: Array(7).fill(false),
      })),
    )
  }

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id)
    setEditingName(habit.name)
  }

  const saveHabitName = () => {
    if (editingId) {
      setHabits(habits.map((habit) => (habit.id === editingId ? { ...habit, name: editingName } : habit)))
      setEditingId(null)
    }
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName("")
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
    if (editingId) {
      cancelEditing()
    }
  }

  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      completed: Array(7).fill(false),
    }
    setHabits([...habits, newHabit])
  }

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const totalTasks = habits.length
  const completedTasks = habits.filter((habit) => habit.completed[currentDayIndex] === "completed").length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="min-h-screen bg-[#fbfbfb] p-8 pt-16 font-mono">
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-center mb-2 text-3xl font-bold">{currentTime}</h1>
        <h2 className="text-center mb-2">
          today is {currentDay},{" "}
          {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toLowerCase()}
        </h2>
        <p className="text-center text-gray-500 mb-4">you have {remainingTasks} tasks remaining</p>

        {/* Progress Bar */}
        <div className="w-3/4 mx-auto">
          <div className="h-4 rounded-full bg-white shadow-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue to-accent-green transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Habit Grid */}
      <div className="max-w-5xl mx-auto">
        {/* Days Header */}
        <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 mb-4">
          <div /> {/* Empty cell for alignment */}
          {days.map((day) => (
            <div key={day} className={`text-center ${day === currentDay ? "font-bold" : ""}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Habits Grid */}
        {habits.map((habit) => (
          <div key={habit.id} className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 mb-4 items-center">
            <div className="flex items-center">
              {editingId === habit.id ? (
                <div className="flex items-center w-full">
                  <Input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveHabitName()
                      if (e.key === "Escape") cancelEditing()
                    }}
                    className="h-8 text-sm mr-2"
                  />
                  <Button size="icon" variant="ghost" onClick={saveHabitName} className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-grow">{habit.name}</span>
                  {editMode && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEditing(habit)} className="h-8 w-8 ml-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteHabit(habit.id)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            {days.map((day, index) => (
              <div key={day} className="flex justify-center">
                <button
                  onClick={() => toggleHabit(habit.id, index)}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors duration-200
                    ${
                      habit.completed[index] === "completed"
                        ? "bg-accent-green"
                        : habit.completed[index] === "skipped"
                          ? "bg-gray-100"
                          : "border-2 border-gray-200 hover:border-gray-300"
                    }
                    ${editMode ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={editMode}
                >
                  {habit.completed[index] === "completed" && <Check className="w-4 w-4 text-white" />}
                </button>
              </div>
            ))}
          </div>
        ))}

        {/* New Habit Row */}
        {editMode && <NewHabitRow onAdd={addHabit} />}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button
          onClick={resetHabits}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={toggleEditMode}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200
            ${editMode ? "bg-accent-green text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          <Pencil className={`w-5 h-5 transition-transform duration-200 ${editMode ? "rotate-45" : ""}`} />
        </button>
      </div>
    </div>
  )
}

