import { useState, useEffect } from 'react'
import { db } from '../database/schema'
import { useMedications } from '../hooks/useMedications'

export function RefillAlerts() {
  const { medications } = useMedications()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRefillAlerts()
  }, [])

  const loadRefillAlerts = async () => {
    try {
      const inventoryItems = await db.inventory.toArray()
      const alerts = []

      for (const item of inventoryItems) {
        const medication = medications.find(med => med.id === item.medicationId)
        if (!medication || !medication.isActive) continue

        // Check if refill is needed
        if (item.quantity <= item.refillThreshold) {
          const urgency = item.quantity === 0 ? 'critical' : 
                         item.quantity <= item.refillThreshold / 2 ? 'high' : 'medium'
          
          alerts.push({
            id: item.id,
            medication,
            inventory: item,
            urgency,
            message: item.quantity === 0 
              ? 'Out of stock - refill immediately'
              : `Low stock (${item.quantity} ${item.unit}) - refill soon`
          })
        }

        // Check if auto-refill is due
        if (item.autoRefill && item.nextRefillDate) {
          const daysUntilRefill = Math.ceil(
            (new Date(item.nextRefillDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          
          if (daysUntilRefill <= 3 && daysUntilRefill >= 0) {
            alerts.push({
              id: `auto-${item.id}`,
              medication,
              inventory: item,
              urgency: 'low',
              message: `Auto-refill due in ${daysUntilRefill} day${daysUntilRefill !== 1 ? 's' : ''}`,
              isAutoRefill: true
            })
          }
        }
      }

      // Sort by urgency
      const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

      setAlerts(alerts)
    } catch (error) {
      console.error('Failed to load refill alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRefilled = async (inventoryId: number) => {
    try {
      const inventory = await db.inventory.get(inventoryId)
      if (!inventory) return

      await db.inventory.update(inventoryId, {
        quantity: inventory.quantity + 30, // Assume 30-day supply
        lastRefillDate: new Date(),
        nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      })

      await loadRefillAlerts()
    } catch (error) {
      console.error('Failed to mark as refilled:', error)
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    // In a real app, you'd store dismissed alerts in the database
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getUrgencyBgColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'high': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          All caught up!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No refill alerts at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${getUrgencyBgColor(alert.urgency)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getUrgencyIcon(alert.urgency)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {alert.medication.name}
                  </h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getUrgencyColor(alert.urgency)} bg-white dark:bg-gray-800`}>
                    {alert.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {alert.message}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {alert.inventory.pharmacy && `Pharmacy: ${alert.inventory.pharmacy}`}
                  {alert.inventory.prescriptionNumber && ` • Rx #: ${alert.inventory.prescriptionNumber}`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!alert.isAutoRefill && (
                <button
                  onClick={() => handleMarkRefilled(alert.inventory.id)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Refilled
                </button>
              )}
              <button
                onClick={() => handleDismissAlert(alert.id)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
