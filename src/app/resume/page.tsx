'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { JobEntry, EducationEntry } from '@/types/entry'

export default function Resume() {
  const [jobs, setJobs] = useState<JobEntry[]>([])
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [jobsRes, eduRes] = await Promise.all([
        fetch('/api/entries?type=job'),
        fetch('/api/entries?type=education')
      ])
      const jobsData = await jobsRes.json()
      const eduData = await eduRes.json()

      // Sort by start date (most recent first)
      setJobs(jobsData.sort((a: JobEntry, b: JobEntry) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ))
      setEducation(eduData.sort((a: EducationEntry, b: EducationEntry) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ))
    } catch (error) {
      console.error('Error fetching resume data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold">Resume / CV</h1>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Print / Save PDF
            </button>
            <Link href="/" className="text-blue-500 hover:underline">
              ← Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading resume data...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 shadow-lg print:shadow-none">
            {/* Professional Experience */}
            {jobs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                  Professional Experience
                </h2>
                {jobs.map((job) => (
                  <div key={job._id.toString()} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {job.companyName}
                        </p>
                      </div>
                      <p className="text-gray-500">
                        {formatDate(job.startDate)} - {job.endDate ? formatDate(job.endDate) : 'Present'}
                      </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-2">{job.content}</p>

                    {job.keyAchievements && job.keyAchievements.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold mb-1">Key Achievements:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {job.keyAchievements.map((achievement, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.skillsDeveloped && job.skillsDeveloped.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.skillsDeveloped.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu._id.toString()} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{edu.qualification}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {edu.institution}
                        </p>
                      </div>
                      <p className="text-gray-500">
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-2">{edu.content}</p>

                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold mb-1">Achievements:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {edu.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {edu.notableProjects && edu.notableProjects.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1">Notable Projects:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {edu.notableProjects.map((project, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              {project}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {jobs.length === 0 && education.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No job or education entries yet
                </p>
                <Link href="/entry/new" className="text-blue-500 hover:underline">
                  Add your first entry
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  )
}
