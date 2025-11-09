'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import SearchBar from '@/components/SearchBar'
import { Entry } from '@/types/entry'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      performSearch()
    } else {
      setLoading(false)
    }
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Home
          </Link>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search query to find entries</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No results found for "{query}"</p>
            <p className="text-sm text-gray-400">Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <div className="space-y-6">
              {results.map((entry) => (
                <EntryCard key={entry._id.toString()} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8"><p className="text-center">Loading...</p></div>}>
      <SearchResults />
    </Suspense>
  )
}
