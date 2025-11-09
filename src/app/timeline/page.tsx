'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import { Entry } from '@/types/entry'

export default function Timeline() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Timeline</h1>
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
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No entries yet</p>
            <Link href="/entry/new" className="text-blue-500 hover:underline">
              Create your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <EntryCard key={entry._id.toString()} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
