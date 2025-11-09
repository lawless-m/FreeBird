'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import { Entry } from '@/types/entry'

export default function Categories() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
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

  const categories = Array.from(new Set(entries.map(e => e.category))).sort()
  const filteredEntries = selectedCategory
    ? entries.filter(e => e.category === selectedCategory)
    : entries

  const entriesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = entries.filter(e => e.category === cat)
    return acc
  }, {} as Record<string, Entry[]>)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Categories</h1>
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
          <>
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All ({entries.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat} ({entriesByCategory[cat].length})
                  </button>
                ))}
              </div>
            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
