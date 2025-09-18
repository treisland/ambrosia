import { db, type Inventory } from './schema'

export class InventoryService {
  // Create inventory record
  static async create(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return await db.inventory.add(inventory as Inventory)
  }

  // Get inventory for a medication
  static async getByMedicationId(medicationId: number): Promise<Inventory | undefined> {
    return await db.inventory.where('medicationId').equals(medicationId).first()
  }

  // Get all inventory records
  static async getAll(): Promise<Inventory[]> {
    return await db.inventory.toArray()
  }

  // Update inventory
  static async update(id: number, updates: Partial<Omit<Inventory, 'id' | 'createdAt'>>): Promise<void> {
    await db.inventory.update(id, updates)
  }

  // Update quantity (when taking a dose)
  static async decrementQuantity(medicationId: number, amount: number = 1): Promise<void> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory) return

    const newQuantity = Math.max(0, inventory.quantity - amount)
    await this.update(inventory.id!, { quantity: newQuantity })
  }

  // Add to inventory (refill)
  static async addQuantity(medicationId: number, amount: number): Promise<void> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory) return

    const newQuantity = inventory.quantity + amount
    await this.update(inventory.id!, { 
      quantity: newQuantity,
      lastRefillDate: new Date()
    })
  }

  // Check if medication needs refill
  static async needsRefill(medicationId: number): Promise<boolean> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory) return false

    return inventory.quantity <= inventory.refillThreshold
  }

  // Get medications needing refill
  static async getMedicationsNeedingRefill(): Promise<Inventory[]> {
    return await db.inventory
      .where('quantity')
      .below(db.inventory.where('refillThreshold'))
      .toArray()
  }

  // Calculate days until empty
  static async getDaysUntilEmpty(medicationId: number): Promise<number | null> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory || inventory.quantity === 0) return null

    // This would need to be calculated based on the medication's schedule
    // For now, return a simple estimate
    const dailyDoses = 2 // This should come from the schedule
    return Math.ceil(inventory.quantity / dailyDoses)
  }

  // Set refill threshold
  static async setRefillThreshold(medicationId: number, threshold: number): Promise<void> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory) return

    await this.update(inventory.id!, { refillThreshold: threshold })
  }

  // Enable/disable auto-refill
  static async setAutoRefill(medicationId: number, enabled: boolean): Promise<void> {
    const inventory = await this.getByMedicationId(medicationId)
    if (!inventory) return

    await this.update(inventory.id!, { autoRefill: enabled })
  }

  // Get inventory statistics
  static async getStats(): Promise<{
    totalMedications: number
    lowStock: number
    outOfStock: number
    autoRefillEnabled: number
  }> {
    const all = await this.getAll()
    
    const lowStock = all.filter(inv => inv.quantity <= inv.refillThreshold && inv.quantity > 0).length
    const outOfStock = all.filter(inv => inv.quantity === 0).length
    const autoRefillEnabled = all.filter(inv => inv.autoRefill).length

    return {
      totalMedications: all.length,
      lowStock,
      outOfStock,
      autoRefillEnabled
    }
  }

  // Delete inventory record
  static async delete(id: number): Promise<void> {
    await db.inventory.delete(id)
  }

  // Delete inventory for medication
  static async deleteByMedicationId(medicationId: number): Promise<void> {
    await db.inventory.where('medicationId').equals(medicationId).delete()
  }
}
