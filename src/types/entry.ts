import { Types } from 'mongoose'

export type EntryType = 'idea' | 'work' | 'outcome' | 'job' | 'education'

export type IdeaStatus = 'new' | 'in-progress' | 'completed' | 'abandoned'

export interface BaseEntry {
  _id: Types.ObjectId
  type: EntryType
  title: string
  content: string
  date: Date
  category: string
  tags: string[]
  images: string[]
  relatedTo: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export interface IdeaEntry extends BaseEntry {
  type: 'idea'
  status: IdeaStatus
  notes?: string
}

export interface WorkEntry extends BaseEntry {
  type: 'work'
  whatWasDone: string
  toolsUsed: string[]
  timeInvested?: number
}

export interface OutcomeEntry extends BaseEntry {
  type: 'outcome'
  impact: string
  learned: string
  wouldDoDifferently?: string
}

export interface JobEntry extends BaseEntry {
  type: 'job'
  companyName: string
  jobTitle: string
  startDate: Date
  endDate?: Date
  starEntries: STAREntry[]
  skillsDeveloped: string[]
  keyAchievements: string[]
}

export interface STAREntry {
  situation: string
  task: string
  action: string
  result: string
}

export interface EducationEntry extends BaseEntry {
  type: 'education'
  institution: string
  qualification: string
  startDate: Date
  endDate?: Date
  notableProjects: string[]
  achievements: string[]
}

export type Entry = IdeaEntry | WorkEntry | OutcomeEntry | JobEntry | EducationEntry
