import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    about: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      avatarUrl: {
        type: String,
        trim: true,
      },
      logoUrl: {
        type: String,
        trim: true,
      },
      education: {
        type: String,
        trim: true,
      },
    },
    skills: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
        },
        items: {
          type: [String],
          required: true,
        },
      },
    ],
    interests: {
      type: [String],
      default: [],
    },
    contact: {
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      socialLinks: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          url: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export default Portfolio;
