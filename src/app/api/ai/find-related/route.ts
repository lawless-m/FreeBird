import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import dbConnect from '@/lib/mongodb'
import EntryModel from '@/models/Entry'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// POST /api/ai/find-related - Find related entries using AI
export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    await dbConnect()

    const { entryId } = await request.json()

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const entry = await EntryModel.findById(entryId).exec()

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Get all other entries
    const allEntries = await EntryModel.find({
      _id: { $ne: entryId }
    })
      .select('_id title content category tags type date')
      .limit(100) // Limit to prevent token overflow
      .exec()

    if (allEntries.length === 0) {
      return NextResponse.json({ related: [] })
    }

    // Build context for Claude
    const currentEntry = `Title: ${entry.title}\nContent: ${entry.content}\nCategory: ${entry.category}\nTags: ${entry.tags?.join(', ') || 'none'}\nType: ${entry.type}`

    const candidateEntries = allEntries.map((e, idx) =>
      `[${idx}] Title: ${e.title} | Category: ${e.category} | Type: ${e.type} | Tags: ${e.tags?.join(', ') || 'none'}`
    ).join('\n')

    // Call Claude API to find related entries
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a personal knowledge base entry. Your task is to find the most related entries based on topic similarity, shared skills, related outcomes, or thematic connections.

CURRENT ENTRY:
${currentEntry}

CANDIDATE ENTRIES:
${candidateEntries}

Identify the top 5 most related entries by index number. Consider:
- Topical similarity
- Shared technologies/tools
- Related projects or outcomes
- Thematic connections
- Complementary skills

Respond ONLY with a JSON array of index numbers, like: [2, 5, 12, 7, 9]
If fewer than 5 are related, include only those that are truly relevant.`
        }
      ]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '[]'

    // Parse the response to get entry indices
    let relatedIndices: number[] = []
    try {
      relatedIndices = JSON.parse(responseText)
    } catch (e) {
      // Fallback to simple keyword matching if Claude response fails
      console.warn('Failed to parse Claude response, using fallback')
      return NextResponse.json({ related: await fallbackRelatedSearch(entry, allEntries) })
    }

    // Get the full entry details for the related entries
    const related = relatedIndices
      .filter(idx => idx >= 0 && idx < allEntries.length)
      .map(idx => allEntries[idx])

    return NextResponse.json({ related })
  } catch (error) {
    console.error('Error finding related entries:', error)
    // Fallback to simple matching if AI fails
    await dbConnect()
    const entry = await EntryModel.findById((await request.json()).entryId).exec()
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    const allEntries = await EntryModel.find({ _id: { $ne: entry._id } })
      .select('_id title content category tags type')
      .limit(100)
      .exec()
    return NextResponse.json({ related: await fallbackRelatedSearch(entry, allEntries) })
  }
}

// Fallback function for simple keyword-based matching
async function fallbackRelatedSearch(entry: any, allEntries: any[]) {
  const entryWords = new Set(
    `${entry.title} ${entry.content} ${entry.category} ${entry.tags?.join(' ') || ''}`
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  )

  const scored = allEntries.map(e => {
    const candidateWords = `${e.title} ${e.content} ${e.category} ${e.tags?.join(' ') || ''}`
      .toLowerCase()
      .split(/\s+/)

    const matches = candidateWords.filter(w => entryWords.has(w)).length
    const categoryMatch = e.category === entry.category ? 10 : 0

    return { entry: e, score: matches + categoryMatch }
  })

  return scored
    .filter(s => s.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.entry)
}
