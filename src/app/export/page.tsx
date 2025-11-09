'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ExportPage() {
  const [exporting, setExporting] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const handleExport = async (format: 'json' | 'markdown') => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ format })
      if (selectedType) params.append('type', selectedType)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/export?${params.toString()}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `freebird-export-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Export Data</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Home
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Export your entries in various formats for backup or external use.
          </p>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Filters (Optional)</h2>

            <div>
              <label className="block mb-2 font-medium">Filter by Entry Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Types</option>
                <option value="idea">Ideas</option>
                <option value="work">Work</option>
                <option value="outcome">Outcomes</option>
                <option value="job">Jobs</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Filter by Category</label>
              <input
                type="text"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="e.g., software, ceramics"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-2">JSON Format</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Machine-readable format, ideal for data processing and migration
              </p>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export as JSON'}
              </button>
            </div>

            <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-2">Markdown Format</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Human-readable format, great for documentation and sharing
              </p>
              <button
                onClick={() => handleExport('markdown')}
                disabled={exporting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export as Markdown'}
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Export Tips</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• JSON exports include all metadata and can be re-imported</li>
              <li>• Markdown exports are formatted for readability</li>
              <li>• Use filters to export specific subsets of your data</li>
              <li>• Regular backups are recommended for data safety</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
