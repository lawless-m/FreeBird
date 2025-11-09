'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EntryType, IdeaStatus } from '@/types/entry'

export default function NewEntry() {
  const router = useRouter()
  const [type, setType] = useState<EntryType>('idea')
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.url) {
          setImages(prev => [...prev, data.url])
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const baseData = {
      type,
      title: formData.get('title'),
      content: formData.get('content'),
      date: formData.get('date'),
      category: formData.get('category'),
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      images
    }

    let entryData: any = { ...baseData }

    // Add type-specific fields
    switch (type) {
      case 'idea':
        entryData.status = formData.get('status')
        entryData.notes = formData.get('notes')
        break
      case 'work':
        entryData.whatWasDone = formData.get('whatWasDone')
        entryData.toolsUsed = (formData.get('toolsUsed') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
        const timeInvested = formData.get('timeInvested')
        if (timeInvested) entryData.timeInvested = Number(timeInvested)
        break
      case 'outcome':
        entryData.impact = formData.get('impact')
        entryData.learned = formData.get('learned')
        entryData.wouldDoDifferently = formData.get('wouldDoDifferently')
        break
      case 'job':
        entryData.companyName = formData.get('companyName')
        entryData.jobTitle = formData.get('jobTitle')
        entryData.startDate = formData.get('startDate')
        const endDate = formData.get('endDate')
        if (endDate) entryData.endDate = endDate
        entryData.skillsDeveloped = (formData.get('skillsDeveloped') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
        entryData.keyAchievements = (formData.get('keyAchievements') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
        break
      case 'education':
        entryData.institution = formData.get('institution')
        entryData.qualification = formData.get('qualification')
        entryData.startDate = formData.get('startDate')
        const eduEndDate = formData.get('endDate')
        if (eduEndDate) entryData.endDate = eduEndDate
        entryData.notableProjects = (formData.get('notableProjects') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
        entryData.achievements = (formData.get('achievements') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
        break
    }

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      })

      if (response.ok) {
        router.push('/timeline')
      } else {
        alert('Failed to create entry')
      }
    } catch (error) {
      console.error('Error creating entry:', error)
      alert('Failed to create entry')
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">New Entry</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entry Type */}
          <div>
            <label className="block mb-2 font-semibold">Entry Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntryType)}
              className="w-full p-2 border rounded"
            >
              <option value="idea">Idea</option>
              <option value="work">Work</option>
              <option value="outcome">Outcome</option>
              <option value="job">Job</option>
              <option value="education">Education</option>
            </select>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block mb-2 font-semibold">Title *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Content *</label>
            <textarea
              name="content"
              required
              rows={6}
              className="w-full p-2 border rounded"
              placeholder="Markdown supported"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Category *</label>
            <input
              type="text"
              name="category"
              required
              placeholder="e.g., software, ceramics, 3dprinting, aquatics"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Comma-separated tags"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 font-semibold">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full p-2 border rounded"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            {images.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {images.map((url, idx) => (
                  <img key={idx} src={url} alt={`Upload ${idx}`} className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          {/* Type-specific fields */}
          {type === 'idea' && (
            <>
              <div>
                <label className="block mb-2 font-semibold">Status</label>
                <select name="status" className="w-full p-2 border rounded">
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Notes</label>
                <textarea name="notes" rows={4} className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          {type === 'work' && (
            <>
              <div>
                <label className="block mb-2 font-semibold">What Was Done *</label>
                <textarea name="whatWasDone" required rows={4} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Tools/Technologies Used</label>
                <input
                  type="text"
                  name="toolsUsed"
                  placeholder="Comma-separated"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Time Invested (hours)</label>
                <input type="number" name="timeInvested" className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          {type === 'outcome' && (
            <>
              <div>
                <label className="block mb-2 font-semibold">Impact/Results *</label>
                <textarea name="impact" required rows={4} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">What Was Learned *</label>
                <textarea name="learned" required rows={4} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">What Would Be Done Differently</label>
                <textarea name="wouldDoDifferently" rows={4} className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          {type === 'job' && (
            <>
              <div>
                <label className="block mb-2 font-semibold">Company Name *</label>
                <input type="text" name="companyName" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Job Title *</label>
                <input type="text" name="jobTitle" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Start Date *</label>
                <input type="date" name="startDate" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">End Date</label>
                <input type="date" name="endDate" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Skills Developed</label>
                <input
                  type="text"
                  name="skillsDeveloped"
                  placeholder="Comma-separated"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Key Achievements</label>
                <textarea
                  name="keyAchievements"
                  placeholder="Comma-separated"
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}

          {type === 'education' && (
            <>
              <div>
                <label className="block mb-2 font-semibold">Institution *</label>
                <input type="text" name="institution" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Qualification *</label>
                <input type="text" name="qualification" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Start Date *</label>
                <input type="date" name="startDate" required className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">End Date</label>
                <input type="date" name="endDate" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Notable Projects</label>
                <input
                  type="text"
                  name="notableProjects"
                  placeholder="Comma-separated"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Achievements</label>
                <textarea
                  name="achievements"
                  placeholder="Comma-separated"
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Create Entry
          </button>
        </form>
      </div>
    </main>
  )
}
