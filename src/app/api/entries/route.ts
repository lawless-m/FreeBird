import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EntryModel from '@/models/Entry'

// GET /api/entries - List all entries with optional filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    const query: any = {}
    if (type) query.type = type
    if (category) query.category = category
    if (tag) query.tags = tag

    const entries = await EntryModel.find(query)
      .sort({ date: -1 })
      .populate('relatedTo')
      .exec()

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

// POST /api/entries - Create a new entry
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const entry = await EntryModel.create(body)

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}
