import { useState } from 'react'
import type { TaperStep } from '../database/schema'

export type ScheduleType = 'fixed' | 'interval' | 'cycle' | 'taper' | 'prn'

interface AdvancedScheduleFormProps {
  onScheduleChange: (schedule: any) => void
}

export function AdvancedScheduleForm({ onScheduleChange }: AdvancedScheduleFormProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('fixed')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]) // Monday to Friday
  const [intervalHours, setIntervalHours] = useState(8)
  const [cycleDaysOn, setCycleDaysOn] = useState(7)
  const [cycleDaysOff, setCycleDaysOff] = useState(7)
  const [taperSchedule, setTaperSchedule] = useState<TaperStep[]>([
    { week: 1, dosage: '10mg', frequency: '1x daily' },
    { week: 2, dosage: '5mg', frequency: '1x daily' },
    { week: 3, dosage: '2.5mg', frequency: '1x daily' }
  ])
  const [prnLimits, setPrnLimits] = useState({
    minIntervalHours: 4,
    maxDosesPerDay: 3,
    maxDosePerDay: 10
  })
  const [mealTiming, setMealTiming] = useState<'before' | 'with' | 'after' | 'none'>('none')

  const handleTimeAdd = () => {
    setTimes([...times, '12:00'])
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times]
    newTimes[index] = value
    setTimes(newTimes)
    updateSchedule()
  }

  const handleTimeRemove = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index))
    }
  }

  const handleDayToggle = (day: number) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day))
    } else {
      setDays([...days, day].sort())
    }
    updateSchedule()
  }

  const handleTaperStepAdd = () => {
    const newWeek = Math.max(...taperSchedule.map(s => s.week)) + 1
    setTaperSchedule([...taperSchedule, { week: newWeek, dosage: '5mg', frequency: '1x daily' }])
  }

  const handleTaperStepChange = (index: number, field: keyof TaperStep, value: string) => {
    const newSteps = [...taperSchedule]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setTaperSchedule(newSteps)
    updateSchedule()
  }

  const handleTaperStepRemove = (index: number) => {
    if (taperSchedule.length > 1) {
      setTaperSchedule(taperSchedule.filter((_, i) => i !== index))
    }
  }

  const updateSchedule = () => {
    const baseSchedule = {
      type: scheduleType,
      times,
      days,
      mealTiming,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startDate: new Date(),
      isActive: true
    }

    let schedule: any = { ...baseSchedule }

    switch (scheduleType) {
      case 'interval':
        schedule = { ...schedule, intervalHours }
        break
      case 'cycle':
        schedule = { ...schedule, cycleDaysOn, cycleDaysOff }
        break
      case 'taper':
        schedule = { ...schedule, taperSchedule }
        break
      case 'prn':
        schedule = { ...schedule, prnLimits }
        break
    }

    onScheduleChange(schedule)
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="space-y-6">
      {/* Schedule Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Schedule Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'fixed', label: 'Fixed Times', desc: 'Same times daily' },
            { value: 'interval', label: 'Interval', desc: 'Every X hours' },
            { value: 'cycle', label: 'Cycle', desc: 'On/off periods' },
            { value: 'taper', label: 'Taper', desc: 'Gradually reduce' },
            { value: 'prn', label: 'As Needed', desc: 'When required' }
          ].map((type) => (
            <label key={type.value} className="relative">
              <input
                type="radio"
                name="scheduleType"
                value={type.value}
                checked={scheduleType === type.value}
                onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                className="sr-only peer"
              />
              <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Fixed Times */}
      {scheduleType === 'fixed' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Times
            </label>
            {times.map((time, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleTimeRemove(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleTimeAdd}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Time
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days of Week
            </label>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <label key={index} className="relative">
                  <input
                    type="checkbox"
                    checked={days.includes(index)}
                    onChange={() => handleDayToggle(index)}
                    className="sr-only peer"
                  />
                  <div className="p-2 text-center text-xs border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20">
                    {day.slice(0, 3)}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interval Schedule */}
      {scheduleType === 'interval' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interval (hours)
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={intervalHours}
            onChange={(e) => setIntervalHours(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {/* Cycle Schedule */}
      {scheduleType === 'cycle' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days On
            </label>
            <input
              type="number"
              min="1"
              value={cycleDaysOn}
              onChange={(e) => setCycleDaysOn(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Days Off
            </label>
            <input
              type="number"
              min="1"
              value={cycleDaysOff}
              onChange={(e) => setCycleDaysOff(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Taper Schedule */}
      {scheduleType === 'taper' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Taper Schedule
          </label>
          <div className="space-y-3">
            {taperSchedule.map((step, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Week</label>
                  <input
                    type="number"
                    min="1"
                    value={step.week}
                    onChange={(e) => handleTaperStepChange(index, 'week', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={step.dosage}
                    onChange={(e) => handleTaperStepChange(index, 'dosage', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={step.frequency}
                    onChange={(e) => handleTaperStepChange(index, 'frequency', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {taperSchedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleTaperStepRemove(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleTaperStepAdd}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Taper Step
            </button>
          </div>
        </div>
      )}

      {/* PRN Limits */}
      {scheduleType === 'prn' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Interval (hours)
            </label>
            <input
              type="number"
              min="1"
              value={prnLimits.minIntervalHours}
              onChange={(e) => setPrnLimits({...prnLimits, minIntervalHours: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Doses/Day
            </label>
            <input
              type="number"
              min="1"
              value={prnLimits.maxDosesPerDay}
              onChange={(e) => setPrnLimits({...prnLimits, maxDosesPerDay: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Dose/Day
            </label>
            <input
              type="number"
              min="1"
              value={prnLimits.maxDosePerDay}
              onChange={(e) => setPrnLimits({...prnLimits, maxDosePerDay: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Meal Timing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Meal Timing
        </label>
        <select
          value={mealTiming}
          onChange={(e) => setMealTiming(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="none">No specific timing</option>
          <option value="before">Before meals</option>
          <option value="with">With meals</option>
          <option value="after">After meals</option>
        </select>
      </div>
    </div>
  )
}
