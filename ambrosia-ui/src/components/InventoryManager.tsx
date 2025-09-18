import { useState, useEffect } from 'react'
import { db } from '../database/schema'

interface InventoryManagerProps {
  medicationId: number
  onInventoryUpdate?: () => void
}

export function InventoryManager({ medicationId, onInventoryUpdate }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    quantity: 0,
    unit: 'tablets' as 'tablets' | 'capsules' | 'ml' | 'doses' | 'pills',
    refillThreshold: 7,
    autoRefill: false,
    pharmacy: '',
    prescriptionNumber: ''
  })

  useEffect(() => {
    loadInventory()
  }, [medicationId])

  const loadInventory = async () => {
    try {
      const inventoryData = await db.inventory
        .where('medicationId')
        .equals(medicationId)
        .first()
      
      if (inventoryData) {
        setInventory(inventoryData)
        setFormData({
          quantity: inventoryData.quantity,
          unit: inventoryData.unit,
          refillThreshold: inventoryData.refillThreshold,
          autoRefill: inventoryData.autoRefill,
          pharmacy: inventoryData.pharmacy || '',
          prescriptionNumber: inventoryData.prescriptionNumber || ''
        })
      } else {
        // Create default inventory
        const newInventory = {
          medicationId,
          quantity: 0,
          unit: 'tablets' as const,
          refillThreshold: 7,
          autoRefill: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await db.inventory.add(newInventory)
        setInventory(newInventory)
      }
    } catch (error) {
      console.error('Failed to load inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (inventory) {
        await db.inventory.update(inventory.id!, {
          ...formData,
          updatedAt: new Date()
        })
      } else {
        await db.inventory.add({
          medicationId,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      
      await loadInventory()
      setEditing(false)
      onInventoryUpdate?.()
    } catch (error) {
      console.error('Failed to save inventory:', error)
    }
  }

  const handleRefill = async () => {
    try {
      const newQuantity = formData.quantity + 30 // Assume 30-day supply
      await db.inventory.update(inventory!.id!, {
        quantity: newQuantity,
        lastRefillDate: new Date(),
        nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      })
      
      await loadInventory()
      onInventoryUpdate?.()
    } catch (error) {
      console.error('Failed to refill inventory:', error)
    }
  }

  const getStatusColor = () => {
    if (!inventory) return 'text-gray-500'
    if (inventory.quantity <= 0) return 'text-red-600'
    if (inventory.quantity <= inventory.refillThreshold) return 'text-amber-600'
    return 'text-green-600'
  }

  const getStatusText = () => {
    if (!inventory) return 'No inventory data'
    if (inventory.quantity <= 0) return 'Out of stock'
    if (inventory.quantity <= inventory.refillThreshold) return 'Low stock'
    return 'In stock'
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inventory Management
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value as 'tablets' | 'capsules' | 'ml' | 'doses' | 'pills'})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="tablets">Tablets</option>
                <option value="capsules">Capsules</option>
                <option value="ml">ML</option>
                <option value="doses">Doses</option>
                <option value="pills">Pills</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refill Threshold
            </label>
            <input
              type="number"
              min="1"
              value={formData.refillThreshold}
              onChange={(e) => setFormData({...formData, refillThreshold: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Alert when quantity falls below this number
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefill"
              checked={formData.autoRefill}
              onChange={(e) => setFormData({...formData, autoRefill: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="autoRefill" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable auto-refill
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pharmacy
              </label>
              <input
                type="text"
                value={formData.pharmacy}
                onChange={(e) => setFormData({...formData, pharmacy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Pharmacy name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prescription #
              </label>
              <input
                type="text"
                value={formData.prescriptionNumber}
                onChange={(e) => setFormData({...formData, prescriptionNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Prescription number"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {inventory?.quantity || 0} {inventory?.unit || 'units'}
            </div>
            {inventory?.quantity <= inventory?.refillThreshold && inventory?.quantity > 0 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Refill needed soon
              </div>
            )}
          </div>

          {/* Inventory Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Refill Threshold</div>
              <div className="font-medium">{inventory?.refillThreshold || 0} {inventory?.unit || 'units'}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Auto Refill</div>
              <div className="font-medium">
                {inventory?.autoRefill ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            {inventory?.pharmacy && (
              <div>
                <div className="text-gray-600 dark:text-gray-400">Pharmacy</div>
                <div className="font-medium">{inventory.pharmacy}</div>
              </div>
            )}
            {inventory?.lastRefillDate && (
              <div>
                <div className="text-gray-600 dark:text-gray-400">Last Refill</div>
                <div className="font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(new Date(inventory.lastRefillDate))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleRefill}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Mark as Refilled
            </button>
            {inventory?.pharmacy && (
              <button
                onClick={() => {
                  // In a real app, this would open pharmacy contact or refill request
                  alert('Pharmacy contact feature coming soon!')
                }}
                className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Contact Pharmacy
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
