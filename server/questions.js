const axios = require('axios');
require('dotenv').config();
const localQuestions = require('./questions.json');

let questionsPool = [...localQuestions];

const fetchQuestions = async () => {
  try {
    console.log('Fetching questions from QuizAPI...');
    const response = await axios.get('https://quizapi.io/api/v1/questions', {
      headers: { 'X-Api-Key': process.env.QUIZ_API_KEY },
      params: { 
        limit: 20,
        category: 'Code',
        difficulty: 'Easy'
      }
    });

    if (response.data && Array.isArray(response.data)) {
      const newQuestions = response.data.map(q => {
        const validOptions = Object.values(q.answers).filter(a => a !== null);
        const answerKeys = Object.keys(q.answers); 
        const correctKeys = Object.keys(q.correct_answers); 
        
        const correctKeySuffix = correctKeys.find(k => q.correct_answers[k] === 'true'); 
        
        let correctIndex = -1;
        if (correctKeySuffix) {
            const key = correctKeySuffix.replace('_correct', '');
            const entries = Object.entries(q.answers).filter(([k, v]) => v !== null);
            correctIndex = entries.findIndex(([k, v]) => k === key);
            
            return {
                id: q.id.toString(),
                text: q.question,
                options: entries.map(([k, v]) => v),
                correctAnswer: correctIndex
            };
        }
        return null;
      }).filter(q => q !== null && q.correctAnswer !== -1 && q.options.length > 1);

      if (newQuestions.length > 0) {
        questionsPool = newQuestions;
        console.log(`Loaded ${newQuestions.length} questions from QuizAPI`);
      }
    }
  } catch (error) {
    console.error('Failed to fetch from QuizAPI, using local questions:', error.message);
  }
};

fetchQuestions();

const getRandomQuestion = (excludeId) => {
  const availableQuestions = excludeId 
    ? questionsPool.filter(q => q.id !== excludeId)
    : questionsPool;
    
  if (availableQuestions.length === 0) return questionsPool[0];

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

module.exports = {
  getRandomQuestion
};
