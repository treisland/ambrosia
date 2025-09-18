import { useState } from 'react'
import { useMedications } from '../hooks/useMedications'
import { useNavigate } from 'react-router-dom'
import type { Medication } from '../database/schema'

export default function Add() {
  const { addMedication } = useMedications()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    dosage: '',
    form: 'tablet' as const,
    route: 'oral' as const,
    instructions: '',
    purpose: '',
    prescriber: '',
    pharmacy: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.dosage) {
      setError('Name and dosage are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        isActive: true
      }

      await addMedication(medicationData)
      navigate('/meds')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add medication')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Add Medication</h2>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
          <div className="text-sm font-medium">Scan Barcode</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Coming soon</div>
        </button>
        <button className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
          <div className="text-sm font-medium">Import Rx</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Coming soon</div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Medication Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              placeholder="e.g., Metformin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Generic Name
            </label>
            <input
              type="text"
              value={formData.genericName}
              onChange={handleChange('genericName')}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              placeholder="e.g., Metformin HCl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Dosage *
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={handleChange('dosage')}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g., 500 mg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Form
              </label>
              <select
                value={formData.form}
                onChange={handleChange('form')}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
                <option value="patch">Patch</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={handleChange('instructions')}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              placeholder="e.g., Take with food"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={handleChange('purpose')}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              placeholder="e.g., Type 2 diabetes management"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Prescriber
              </label>
              <input
                type="text"
                value={formData.prescriber}
                onChange={handleChange('prescriber')}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g., Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Pharmacy
              </label>
              <input
                type="text"
                value={formData.pharmacy}
                onChange={handleChange('pharmacy')}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g., Main St. Pharmacy"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/meds')}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Medication'}
          </button>
      </div>
      </form>
    </div>
  )
}

