import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tech: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: [String],
      required: true,
      trim: true,
      default: [],
    },
    live: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
