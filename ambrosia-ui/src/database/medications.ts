import { db, type Medication } from './schema'

export class MedicationService {
  // Create a new medication
  static async create(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await db.medications.add(medication as Medication)
  }

  // Get all active medications
  static async getAll(): Promise<Medication[]> {
    return await db.medications.where('isActive').equals(1).toArray()
  }

  // Get all medications (including inactive)
  static async getAllIncludingInactive(): Promise<Medication[]> {
    return await db.medications.orderBy('name').toArray()
  }

  // Get medication by ID
  static async getById(id: number): Promise<Medication | undefined> {
    return await db.medications.get(id)
  }

  // Search medications by name
  static async search(query: string): Promise<Medication[]> {
    const lowerQuery = query.toLowerCase()
    return await db.medications
      .where('isActive')
      .equals(1)
      .filter(med => 
        Boolean(med.name.toLowerCase().includes(lowerQuery) ||
        (med.genericName && med.genericName.toLowerCase().includes(lowerQuery)))
      )
      .toArray()
  }

  // Update medication
  static async update(id: number, updates: Partial<Omit<Medication, 'id' | 'createdAt'>>): Promise<void> {
    await db.medications.update(id, updates)
  }

  // Soft delete (deactivate) medication
  static async deactivate(id: number): Promise<void> {
    await db.medications.update(id, { isActive: false })
  }

  // Hard delete medication
  static async delete(id: number): Promise<void> {
    await db.medications.delete(id)
  }

  // Get medications by form
  static async getByForm(form: Medication['form']): Promise<Medication[]> {
    return await db.medications
      .where('isActive')
      .equals(1)
      .and(med => med.form === form)
      .toArray()
  }

  // Get medications by prescriber
  static async getByPrescriber(prescriber: string): Promise<Medication[]> {
    return await db.medications
      .where('isActive')
      .equals(1)
      .and(med => med.prescriber === prescriber)
      .toArray()
  }

  // Get medications expiring soon (for refill alerts)
  static async getExpiringSoon(_days: number = 7): Promise<Medication[]> {
    // This would need to be combined with inventory data
    // For now, return all active medications
    return await this.getAll()
  }

  // Bulk operations
  static async bulkUpdate(updates: Array<{ id: number; updates: Partial<Omit<Medication, 'id' | 'createdAt'>> }>): Promise<void> {
    await db.transaction('rw', db.medications, async () => {
      for (const { id, updates: updateData } of updates) {
        await db.medications.update(id, updateData)
      }
    })
  }

  // Get medication statistics
  static async getStats(): Promise<{
    total: number
    active: number
    inactive: number
    byForm: Record<string, number>
    byPrescriber: Record<string, number>
  }> {
    const all = await db.medications.toArray()
    const active = all.filter(med => med.isActive)
    
    const byForm = all.reduce((acc, med) => {
      acc[med.form] = (acc[med.form] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPrescriber = all.reduce((acc, med) => {
      if (med.prescriber) {
        acc[med.prescriber] = (acc[med.prescriber] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      byForm,
      byPrescriber
    }
  }
}
