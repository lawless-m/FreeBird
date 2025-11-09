'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Entry } from '@/types/entry'

export default function EntryDetail() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [relatedEntries, setRelatedEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEntry()
      fetchRelatedEntries()
    }
  }, [params.id])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/entries/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEntry(data)
      } else {
        console.error('Entry not found')
      }
    } catch (error) {
      console.error('Error fetching entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedEntries = async () => {
    setLoadingRelated(true)
    try {
      const response = await fetch(`/api/ai/find-related`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: params.id })
      })
      if (response.ok) {
        const data = await response.json()
        setRelatedEntries(data.related || [])
      }
    } catch (error) {
      console.error('Error fetching related entries:', error)
    } finally {
      setLoadingRelated(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/entries/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/timeline')
      } else {
        alert('Failed to delete entry')
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry')
    } finally {
      setDeleting(false)
    }
  }

  const handleEnhanceWithAI = async () => {
    setEnhancing(true)
    try {
      const response = await fetch('/api/ai/enhance-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: params.id })
      })

      if (response.ok) {
        const data = await response.json()
        setEnhancedContent(data.enhancedContent)
      } else {
        alert('Failed to enhance content. Make sure ANTHROPIC_API_KEY is set.')
      }
    } catch (error) {
      console.error('Error enhancing content:', error)
      alert('Failed to enhance content')
    } finally {
      setEnhancing(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      idea: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      outcome: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      job: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      education: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </main>
    )
  }

  if (!entry) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 mb-4">Entry not found</p>
          <Link href="/timeline" className="text-blue-500 hover:underline">
            ← Back to Timeline
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/timeline" className="text-blue-500 hover:underline">
            ← Back to Timeline
          </Link>
          <div className="flex gap-2">
            {(entry.type === 'job' || entry.type === 'education') && (
              <button
                onClick={handleEnhanceWithAI}
                disabled={enhancing}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors disabled:opacity-50"
              >
                {enhancing ? 'Enhancing...' : '✨ Enhance with AI'}
              </button>
            )}
            <Link
              href={`/entry/${params.id}/edit`}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Entry Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Type and Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${getTypeColor(entry.type)}`}>
              {entry.type}
            </span>
            <span className="text-gray-500 text-sm">{formatDate(entry.date)}</span>
            {entry.category && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                {entry.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">{entry.title}</h1>

          {/* Content */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap text-lg">{entry.content}</p>
          </div>

          {/* AI Enhanced Content */}
          {enhancedContent && (
            <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">✨ AI-Enhanced Professional Description</span>
              </div>
              <p className="whitespace-pre-wrap text-lg">{enhancedContent}</p>
              <p className="text-xs text-gray-500 mt-3">
                This enhanced version was generated by Claude AI for use in professional documents.
              </p>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {entry.images && entry.images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Type-specific fields */}
          {'status' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Status</h3>
              <p className="capitalize">{entry.status.replace('-', ' ')}</p>
            </div>
          )}

          {'notes' in entry && entry.notes && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}

          {'whatWasDone' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">What Was Done</h3>
              <p className="whitespace-pre-wrap">{entry.whatWasDone}</p>
            </div>
          )}

          {'toolsUsed' in entry && entry.toolsUsed && entry.toolsUsed.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Tools/Technologies Used</h3>
              <div className="flex gap-2 flex-wrap">
                {entry.toolsUsed.map((tool, idx) => (
                  <span key={idx} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {'timeInvested' in entry && entry.timeInvested && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Time Invested</h3>
              <p>{entry.timeInvested} hours</p>
            </div>
          )}

          {'impact' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Impact/Results</h3>
              <p className="whitespace-pre-wrap">{entry.impact}</p>
            </div>
          )}

          {'learned' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">What Was Learned</h3>
              <p className="whitespace-pre-wrap">{entry.learned}</p>
            </div>
          )}

          {'wouldDoDifferently' in entry && entry.wouldDoDifferently && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">What Would Be Done Differently</h3>
              <p className="whitespace-pre-wrap">{entry.wouldDoDifferently}</p>
            </div>
          )}

          {'companyName' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Company</h3>
              <p>{entry.companyName}</p>
            </div>
          )}

          {'jobTitle' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Job Title</h3>
              <p>{entry.jobTitle}</p>
            </div>
          )}

          {'startDate' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Duration</h3>
              <p>
                {formatDate(entry.startDate)} -{' '}
                {'endDate' in entry && entry.endDate ? formatDate(entry.endDate) : 'Present'}
              </p>
            </div>
          )}

          {'skillsDeveloped' in entry && entry.skillsDeveloped && entry.skillsDeveloped.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Skills Developed</h3>
              <div className="flex gap-2 flex-wrap">
                {entry.skillsDeveloped.map((skill, idx) => (
                  <span key={idx} className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {'keyAchievements' in entry && entry.keyAchievements && entry.keyAchievements.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Achievements</h3>
              <ul className="list-disc list-inside space-y-1">
                {entry.keyAchievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {'institution' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Institution</h3>
              <p>{entry.institution}</p>
            </div>
          )}

          {'qualification' in entry && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Qualification</h3>
              <p>{entry.qualification}</p>
            </div>
          )}

          {'notableProjects' in entry && entry.notableProjects && entry.notableProjects.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Notable Projects</h3>
              <ul className="list-disc list-inside space-y-1">
                {entry.notableProjects.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </div>
          )}

          {'achievements' in entry && entry.achievements && entry.achievements.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Achievements</h3>
              <ul className="list-disc list-inside space-y-1">
                {entry.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
            <p>Created: {formatDate(entry.createdAt)}</p>
            <p>Last updated: {formatDate(entry.updatedAt)}</p>
          </div>
        </div>

        {/* Related Entries */}
        {loadingRelated ? (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">Finding related entries...</p>
          </div>
        ) : relatedEntries.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Entries</h2>
            <div className="space-y-3">
              {relatedEntries.map((related) => (
                <Link
                  key={related._id.toString()}
                  href={`/entry/${related._id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{related.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {related.content}
                      </p>
                    </div>
                    <span className={`ml-3 px-2 py-1 text-xs rounded flex-shrink-0 ${getTypeColor(related.type)}`}>
                      {related.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{related.category}</span>
                    <span>•</span>
                    <span>{formatDate(related.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
