import mongoose, { Schema, Model } from 'mongoose'
import { Entry, IdeaEntry, WorkEntry, OutcomeEntry, JobEntry, EducationEntry, STAREntry } from '@/types/entry'

// Base schema with common fields
const baseSchemaFields = {
  type: {
    type: String,
    required: true,
    enum: ['idea', 'work', 'outcome', 'job', 'education']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  relatedTo: {
    type: [Schema.Types.ObjectId],
    ref: 'Entry',
    default: []
  }
}

// STAR entry subdocument schema
const starEntrySchema = new Schema<STAREntry>({
  situation: { type: String, required: true },
  task: { type: String, required: true },
  action: { type: String, required: true },
  result: { type: String, required: true }
}, { _id: false })

// Main entry schema with discriminators
const entrySchema = new Schema(baseSchemaFields, {
  timestamps: true,
  discriminatorKey: 'type'
})

// Create base model
const EntryModel = (mongoose.models.Entry as Model<Entry>) || mongoose.model<Entry>('Entry', entrySchema)

// Idea discriminator
const IdeaModel = EntryModel.discriminator<IdeaEntry>('idea', new Schema({
  status: {
    type: String,
    required: true,
    enum: ['new', 'in-progress', 'completed', 'abandoned'],
    default: 'new'
  },
  notes: String
}))

// Work discriminator
const WorkModel = EntryModel.discriminator<WorkEntry>('work', new Schema({
  whatWasDone: {
    type: String,
    required: true
  },
  toolsUsed: {
    type: [String],
    default: []
  },
  timeInvested: Number
}))

// Outcome discriminator
const OutcomeModel = EntryModel.discriminator<OutcomeEntry>('outcome', new Schema({
  impact: {
    type: String,
    required: true
  },
  learned: {
    type: String,
    required: true
  },
  wouldDoDifferently: String
}))

// Job discriminator
const JobModel = EntryModel.discriminator<JobEntry>('job', new Schema({
  companyName: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  starEntries: {
    type: [starEntrySchema],
    default: []
  },
  skillsDeveloped: {
    type: [String],
    default: []
  },
  keyAchievements: {
    type: [String],
    default: []
  }
}))

// Education discriminator
const EducationModel = EntryModel.discriminator<EducationEntry>('education', new Schema({
  institution: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  notableProjects: {
    type: [String],
    default: []
  },
  achievements: {
    type: [String],
    default: []
  }
}))

export { EntryModel, IdeaModel, WorkModel, OutcomeModel, JobModel, EducationModel }
export default EntryModel
