const questions = require('./questions.json');

const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

module.exports = {
  getRandomQuestion
};
