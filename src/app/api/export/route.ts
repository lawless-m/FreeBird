import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EntryModel from '@/models/Entry'
import { Entry } from '@/types/entry'

// Helper function to convert entry to Markdown
function entryToMarkdown(entry: Entry): string {
  let markdown = `# ${entry.title}\n\n`
  markdown += `**Type**: ${entry.type}\n`
  markdown += `**Date**: ${new Date(entry.date).toLocaleDateString()}\n`
  markdown += `**Category**: ${entry.category}\n\n`

  if (entry.tags && entry.tags.length > 0) {
    markdown += `**Tags**: ${entry.tags.map(t => `#${t}`).join(', ')}\n\n`
  }

  markdown += `## Content\n\n${entry.content}\n\n`

  // Type-specific fields
  if ('status' in entry) {
    markdown += `**Status**: ${entry.status}\n\n`
  }

  if ('notes' in entry && entry.notes) {
    markdown += `## Notes\n\n${entry.notes}\n\n`
  }

  if ('whatWasDone' in entry) {
    markdown += `## What Was Done\n\n${entry.whatWasDone}\n\n`
  }

  if ('toolsUsed' in entry && entry.toolsUsed && entry.toolsUsed.length > 0) {
    markdown += `**Tools Used**: ${entry.toolsUsed.join(', ')}\n\n`
  }

  if ('timeInvested' in entry && entry.timeInvested) {
    markdown += `**Time Invested**: ${entry.timeInvested} hours\n\n`
  }

  if ('impact' in entry) {
    markdown += `## Impact\n\n${entry.impact}\n\n`
  }

  if ('learned' in entry) {
    markdown += `## Learned\n\n${entry.learned}\n\n`
  }

  if ('wouldDoDifferently' in entry && entry.wouldDoDifferently) {
    markdown += `## Would Do Differently\n\n${entry.wouldDoDifferently}\n\n`
  }

  if ('companyName' in entry) {
    markdown += `**Company**: ${entry.companyName}\n`
    markdown += `**Job Title**: ${'jobTitle' in entry ? entry.jobTitle : ''}\n`
    if ('startDate' in entry) {
      const endDate = 'endDate' in entry && entry.endDate
        ? new Date(entry.endDate).toLocaleDateString()
        : 'Present'
      markdown += `**Duration**: ${new Date(entry.startDate).toLocaleDateString()} - ${endDate}\n\n`
    }
  }

  if ('skillsDeveloped' in entry && entry.skillsDeveloped && entry.skillsDeveloped.length > 0) {
    markdown += `**Skills Developed**: ${entry.skillsDeveloped.join(', ')}\n\n`
  }

  if ('keyAchievements' in entry && entry.keyAchievements && entry.keyAchievements.length > 0) {
    markdown += `### Key Achievements\n\n`
    entry.keyAchievements.forEach(achievement => {
      markdown += `- ${achievement}\n`
    })
    markdown += '\n'
  }

  if ('institution' in entry) {
    markdown += `**Institution**: ${entry.institution}\n`
    markdown += `**Qualification**: ${'qualification' in entry ? entry.qualification : ''}\n\n`
  }

  if ('notableProjects' in entry && entry.notableProjects && entry.notableProjects.length > 0) {
    markdown += `### Notable Projects\n\n`
    entry.notableProjects.forEach(project => {
      markdown += `- ${project}\n`
    })
    markdown += '\n'
  }

  if ('achievements' in entry && entry.achievements && entry.achievements.length > 0) {
    markdown += `### Achievements\n\n`
    entry.achievements.forEach(achievement => {
      markdown += `- ${achievement}\n`
    })
    markdown += '\n'
  }

  if (entry.images && entry.images.length > 0) {
    markdown += `## Images\n\n`
    entry.images.forEach((img, idx) => {
      markdown += `![Image ${idx + 1}](${img})\n`
    })
    markdown += '\n'
  }

  markdown += `---\n\n`
  markdown += `*Created: ${new Date(entry.createdAt).toLocaleDateString()}*\n`
  markdown += `*Updated: ${new Date(entry.updatedAt).toLocaleDateString()}*\n\n`

  return markdown
}

// GET /api/export - Export entries in various formats
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    const query: any = {}
    if (type) query.type = type
    if (category) query.category = category

    const entries = await EntryModel.find(query)
      .sort({ date: -1 })
      .exec()

    if (format === 'markdown' || format === 'md') {
      // Export as Markdown
      let markdown = `# FreeBird Export\n\n`
      markdown += `Exported on: ${new Date().toLocaleString()}\n`
      markdown += `Total entries: ${entries.length}\n\n`
      markdown += `---\n\n`

      entries.forEach(entry => {
        markdown += entryToMarkdown(entry)
      })

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="freebird-export-${Date.now()}.md"`
        }
      })
    } else {
      // Export as JSON (default)
      return new NextResponse(JSON.stringify(entries, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="freebird-export-${Date.now()}.json"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting entries:', error)
    return NextResponse.json(
      { error: 'Failed to export entries' },
      { status: 500 }
    )
  }
}
