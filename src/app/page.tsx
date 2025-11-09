'use client'

import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">FreeBird</h1>
        <p className="text-xl mb-6 text-gray-600 dark:text-gray-400">
          Your personal knowledge base for capturing work, ideas, and outcomes
        </p>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/timeline"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Timeline</h2>
            <p className="text-gray-600 dark:text-gray-400">View all entries chronologically</p>
          </Link>

          <Link
            href="/ideas"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Ideas Board</h2>
            <p className="text-gray-600 dark:text-gray-400">Trello-style view of your ideas</p>
          </Link>

          <Link
            href="/work"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Work Log</h2>
            <p className="text-gray-600 dark:text-gray-400">Track completed work</p>
          </Link>

          <Link
            href="/categories"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">Filter by domain</p>
          </Link>

          <Link
            href="/resume"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Resume / CV</h2>
            <p className="text-gray-600 dark:text-gray-400">Generate resume from your entries</p>
          </Link>

          <Link
            href="/export"
            className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Export Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Download your entries in JSON or Markdown</p>
          </Link>
        </div>

        <Link
          href="/entry/new"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          + New Entry
        </Link>
      </div>
    </main>
  )
}
