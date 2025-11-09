import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import dbConnect from '@/lib/mongodb'
import EntryModel from '@/models/Entry'
import { JobEntry, EducationEntry } from '@/types/entry'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// POST /api/ai/enhance-resume - Generate professional descriptions for resume entries
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

    if (entry.type !== 'job' && entry.type !== 'education') {
      return NextResponse.json(
        { error: 'Only job and education entries can be enhanced' },
        { status: 400 }
      )
    }

    // Build context for Claude
    let context = ''
    if (entry.type === 'job') {
      const jobEntry = entry as unknown as JobEntry
      context = `Job Title: ${jobEntry.jobTitle}\n`
      context += `Company: ${jobEntry.companyName}\n`
      context += `Content: ${jobEntry.content}\n`
      if (jobEntry.skillsDeveloped && jobEntry.skillsDeveloped.length > 0) {
        context += `Skills: ${jobEntry.skillsDeveloped.join(', ')}\n`
      }
      if (jobEntry.keyAchievements && jobEntry.keyAchievements.length > 0) {
        context += `Achievements: ${jobEntry.keyAchievements.join('; ')}\n`
      }
    } else {
      const eduEntry = entry as unknown as EducationEntry
      context = `Qualification: ${eduEntry.qualification}\n`
      context += `Institution: ${eduEntry.institution}\n`
      context += `Content: ${eduEntry.content}\n`
      if (eduEntry.achievements && eduEntry.achievements.length > 0) {
        context += `Achievements: ${eduEntry.achievements.join('; ')}\n`
      }
      if (eduEntry.notableProjects && eduEntry.notableProjects.length > 0) {
        context += `Projects: ${eduEntry.notableProjects.join('; ')}\n`
      }
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a professional resume writer. Based on the following ${entry.type} entry, write a compelling, professional description suitable for a resume/CV. Focus on achievements, impact, and professional growth. Use action verbs and quantify results where possible. Keep it concise (2-4 sentences) and professional.

${context}

Provide only the enhanced description, no additional commentary.`
        }
      ]
    })

    const enhancedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : entry.content

    return NextResponse.json({
      enhancedContent,
      originalContent: entry.content
    })
  } catch (error) {
    console.error('Error enhancing resume:', error)
    return NextResponse.json(
      { error: 'Failed to enhance resume entry' },
      { status: 500 }
    )
  }
}
