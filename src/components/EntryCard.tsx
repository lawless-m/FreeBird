import Link from 'next/link'
import { Entry } from '@/types/entry'

interface EntryCardProps {
  entry: Entry
}

export default function EntryCard({ entry }: EntryCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs px-2 py-1 rounded ${getTypeColor(entry.type)}`}>
            {entry.type}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatDate(entry.date)}
          </span>
        </div>
        {entry.category && (
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {entry.category}
          </span>
        )}
      </div>

      <Link href={`/entry/${entry._id}`}>
        <h3 className="text-xl font-semibold mb-2 hover:text-blue-500 transition-colors">
          {entry.title}
        </h3>
      </Link>

      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
        {entry.content}
      </p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {entry.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {entry.images && entry.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {entry.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              className="w-16 h-16 object-cover rounded"
            />
          ))}
          {entry.images.length > 3 && (
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-sm">
              +{entry.images.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
