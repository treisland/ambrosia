import { db } from './schema'

export async function initializeDatabase() {
  try {
    // Check if database is already initialized
    const existingMeds = await db.medications.count()
    if (existingMeds > 0) {
      console.log('Database already initialized')
      return
    }

    // Initialize user settings
    await db.userSettings.add({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        enabled: true,
        reminderMinutes: [15, 5],
        quietHours: {
          start: '22:00',
          end: '07:00'
        },
        sound: true,
        vibration: true
      },
      appearance: {
        theme: 'system',
        fontSize: 'medium'
      },
      privacy: {
        dataSharing: false,
        analytics: false,
        crashReporting: false
      },
      backup: {
        enabled: true,
        frequency: 'weekly'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Add sample medications
    const metforminId = await db.medications.add({
      name: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500 mg',
      form: 'tablet',
      route: 'oral',
      instructions: 'Take with food',
      purpose: 'Type 2 diabetes management',
      prescriber: 'Dr. Smith',
      pharmacy: 'Main St. Pharmacy',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const lisinoprilId = await db.medications.add({
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '20 mg',
      form: 'tablet',
      route: 'oral',
      instructions: 'Take in the morning',
      purpose: 'Blood pressure management',
      prescriber: 'Dr. Smith',
      pharmacy: 'Main St. Pharmacy',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const vitaminDId = await db.medications.add({
      name: 'Vitamin D3',
      genericName: 'Cholecalciferol',
      dosage: '1000 IU',
      form: 'tablet',
      route: 'oral',
      instructions: 'Take with food',
      purpose: 'Vitamin D supplementation',
      prescriber: 'Dr. Smith',
      pharmacy: 'Main St. Pharmacy',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Add schedules
    const metforminScheduleId = await db.schedules.add({
      medicationId: metforminId,
      name: 'Metformin Schedule',
      type: 'fixed',
      times: ['08:00', '20:00'],
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      mealTiming: 'with',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: true,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const lisinoprilScheduleId = await db.schedules.add({
      medicationId: lisinoprilId,
      name: 'Lisinopril Schedule',
      type: 'fixed',
      times: ['12:00'],
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      mealTiming: 'none',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: true,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const vitaminDScheduleId = await db.schedules.add({
      medicationId: vitaminDId,
      name: 'Vitamin D Schedule',
      type: 'fixed',
      times: ['18:00'],
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      mealTiming: 'with',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isActive: true,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Add inventory
    await db.inventory.add({
      medicationId: metforminId,
      quantity: 60,
      unit: 'tablets',
      refillThreshold: 10,
      lastRefillDate: new Date(),
      nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      autoRefill: false,
      pharmacy: 'Main St. Pharmacy',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.inventory.add({
      medicationId: lisinoprilId,
      quantity: 30,
      unit: 'tablets',
      refillThreshold: 5,
      lastRefillDate: new Date(),
      nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRefill: true,
      pharmacy: 'Main St. Pharmacy',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.inventory.add({
      medicationId: vitaminDId,
      quantity: 90,
      unit: 'tablets',
      refillThreshold: 15,
      lastRefillDate: new Date(),
      nextRefillDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      autoRefill: false,
      pharmacy: 'Main St. Pharmacy',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Generate dose events for the next 30 days
    await generateDoseEvents(metforminId, metforminScheduleId, 30)
    await generateDoseEvents(lisinoprilId, lisinoprilScheduleId, 30)
    await generateDoseEvents(vitaminDId, vitaminDScheduleId, 30)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

async function generateDoseEvents(medicationId: number, scheduleId: number, days: number) {
  const schedule = await db.schedules.get(scheduleId)
  if (!schedule) return

  const medication = await db.medications.get(medicationId)
  if (!medication) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const currentDay = new Date(today)
    currentDay.setDate(today.getDate() + i)

    // Check if this day is in the schedule
    const dayOfWeek = currentDay.getDay()
    if (!schedule.days.includes(dayOfWeek)) continue

    // Create dose events for each time
    for (const timeStr of schedule.times) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const scheduledTime = new Date(currentDay)
      scheduledTime.setHours(hours, minutes, 0, 0)

      // Skip if the scheduled time is in the past (except for today)
      if (scheduledTime < new Date() && i > 0) continue

      const status = scheduledTime < new Date() ? 'missed' : 'scheduled'

      await db.doses.add({
        medicationId,
        scheduleId,
        scheduledTime,
        status,
        dosage: medication.dosage,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }
}

export async function clearDatabase() {
  await db.transaction('rw', [db.medications, db.schedules, db.doses, db.inventory, db.userSettings, db.careTeam], async () => {
    await db.medications.clear()
    await db.schedules.clear()
    await db.doses.clear()
    await db.inventory.clear()
    await db.userSettings.clear()
    await db.careTeam.clear()
  })
}
