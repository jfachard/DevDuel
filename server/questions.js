const questions = require('./questions.json');

const getRandomQuestion = (excludeId) => {
  const availableQuestions = excludeId 
    ? questions.filter(q => q.id !== excludeId)
    : questions;
    
  if (availableQuestions.length === 0) return questions[0]; // Fallback

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

module.exports = {
  getRandomQuestion
};
