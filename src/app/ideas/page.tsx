'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IdeaEntry, IdeaStatus } from '@/types/entry'

export default function IdeasBoard() {
  const [ideas, setIdeas] = useState<IdeaEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/entries?type=idea')
      const data = await response.json()
      setIdeas(data)
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const statuses: IdeaStatus[] = ['new', 'in-progress', 'completed', 'abandoned']
  const statusLabels = {
    'new': 'New Ideas',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'abandoned': 'Abandoned'
  }

  const getIdeasByStatus = (status: IdeaStatus) => {
    return ideas.filter(idea => idea.status === status)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ideas Board</h1>
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
            <p className="text-gray-500">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No ideas yet</p>
            <Link href="/entry/new" className="text-blue-500 hover:underline">
              Create your first idea
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statuses.map(status => {
              const statusIdeas = getIdeasByStatus(status)
              return (
                <div key={status} className="flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-1">
                      {statusLabels[status]}
                    </h2>
                    <p className="text-sm text-gray-500">{statusIdeas.length} ideas</p>
                  </div>

                  <div className="flex-1 space-y-3">
                    {statusIdeas.map(idea => (
                      <Link
                        key={idea._id.toString()}
                        href={`/entry/${idea._id}`}
                        className="block bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-semibold mb-2 hover:text-blue-500">
                          {idea.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {idea.content}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {idea.category}
                          </span>
                          <span className="text-gray-500">
                            {formatDate(idea.date)}
                          </span>
                        </div>
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {idea.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
