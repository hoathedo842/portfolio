import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    about: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      avatarUrl: { type: String },
      logoUrl: { type: String },
      education: { type: String },
    },

    skills: [
      {
        category: { type: String, required: true },
        items: { type: [String], required: true },
      },
    ],

    interests: {
      type: [String],
      default: [],
    },

    contact: {
      email: { type: String, required: true },
      phone: { type: String },
      socialLinks: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
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
