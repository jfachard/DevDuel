const axios = require('axios');
require('dotenv').config();
const localQuestions = require('./questions.json');

// Cache for questions by category
const questionCache = {
  'Code': [...localQuestions], // Default fallback
  'Linux': [],
  'SQL': [],
  'Docker': [],
  'DevOps': []
};

const fetchQuestionsForCategory = async (category) => {
  try {
    console.log(`Fetching ${category} questions from QuizAPI...`);
    const response = await axios.get('https://quizapi.io/api/v1/questions', {
      headers: { 'X-Api-Key': process.env.QUIZ_API_KEY },
      params: { 
        limit: 20,
        category: category,
        // difficulty: 'Easy' // Let's get mixed difficulty for variety
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
        // Add to cache, avoiding duplicates
        const existingIds = new Set(questionCache[category].map(q => q.id));
        const uniqueNewQuestions = newQuestions.filter(q => !existingIds.has(q.id));
        
        questionCache[category] = [...questionCache[category], ...uniqueNewQuestions];
        console.log(`Loaded ${uniqueNewQuestions.length} new ${category} questions. Total: ${questionCache[category].length}`);
      }
    }
  } catch (error) {
    console.error(`Failed to fetch ${category} from QuizAPI:`, error.message);
  }
};

const getRandomQuestion = async (category = 'Code', excludeId) => {
  // Initialize cache if empty (except for Code which has local fallback)
  if ((!questionCache[category] || questionCache[category].length === 0) && category !== 'Code') {
     questionCache[category] = []; // Init array
  }

  // If we're running low on questions for this category, fetch more in background
  if (questionCache[category].length < 5) {
    await fetchQuestionsForCategory(category);
  }

  let pool = questionCache[category];
  if (!pool || pool.length === 0) {
    // Fallback to 'Code' (local questions) if specific category fails
    pool = questionCache['Code'];
  }

  const availableQuestions = excludeId 
    ? pool.filter(q => q.id !== excludeId)
    : pool;
    
  if (availableQuestions.length === 0) return pool[0];

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

// Initial fetch to pre-warm cache and verify API connection
fetchQuestionsForCategory('Code');

module.exports = {
  getRandomQuestion
};
