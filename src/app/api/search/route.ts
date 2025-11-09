import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EntryModel from '@/models/Entry'

// GET /api/search - Full-text search across all entries
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    // Perform case-insensitive search across multiple fields
    const searchRegex = new RegExp(query, 'i')

    const entries = await EntryModel.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        // Type-specific fields
        { notes: searchRegex },
        { whatWasDone: searchRegex },
        { toolsUsed: searchRegex },
        { impact: searchRegex },
        { learned: searchRegex },
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { institution: searchRegex },
        { qualification: searchRegex },
      ]
    })
      .sort({ date: -1 })
      .limit(50)
      .exec()

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error searching entries:', error)
    return NextResponse.json(
      { error: 'Failed to search entries' },
      { status: 500 }
    )
  }
}
