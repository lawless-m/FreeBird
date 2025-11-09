'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import { Entry } from '@/types/entry'

export default function WorkLog() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'work' | 'outcome'>('all')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      const data = await response.json()
      // Filter for work and outcome entries
      const workEntries = data.filter((e: Entry) =>
        e.type === 'work' || e.type === 'outcome'
      )
      setEntries(workEntries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.type === filter)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Work Log</h1>
          <div className="flex gap-4">
            <Link href="/entry/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
              + New Entry
            </Link>
            <Link href="/" className="text-blue-500 hover:underline">
              ← Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading work entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No work entries yet</p>
            <Link href="/entry/new" className="text-blue-500 hover:underline">
              Create your first work entry
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Buttons */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                onClick={() => setFilter('work')}
                className={`px-4 py-2 rounded transition-colors ${
                  filter === 'work'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Work ({entries.filter(e => e.type === 'work').length})
              </button>
              <button
                onClick={() => setFilter('outcome')}
                className={`px-4 py-2 rounded transition-colors ${
                  filter === 'outcome'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Outcomes ({entries.filter(e => e.type === 'outcome').length})
              </button>
            </div>

            {/* Entries List */}
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry._id.toString()} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
