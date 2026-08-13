import Portfolio from '../models/Portfolio.js';
import Project from '../models/Project.js';

const getHomePage = async (req, res) => {
  try {
    const projectList = await Project.find({});
    const portfolioData = await Portfolio.findOne({});

    res.status(200).render('home.ejs', {
      projectList,
      portfolioData,
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

export default {
  getHomePage,
};
