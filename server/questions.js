const axios = require('axios');
require('dotenv').config({ quiet: true });

const localQuestions = require('./questions.json');

// Map our game categories to QuizAPI tags
const CATEGORY_TAGS = {
  Code:     'javascript',
  Linux:    'linux',
  SQL:      'sql',
  Docker:   'docker',
  DevOps:   'devops',
  Security: 'cybersecurity',
};

// Seed all categories with local questions as fallback
const questionCache = {
  Code:     [...localQuestions],
  Linux:    [...localQuestions],
  SQL:      [...localQuestions],
  Docker:   [...localQuestions],
  DevOps:   [...localQuestions],
  Security: [...localQuestions],
};

const fetchQuestionsForCategory = async (category) => {
  const apiKey = process.env.QUIZ_API_KEY;
  if (!apiKey) {
    console.warn(`[QuizAPI] QUIZ_API_KEY not set — using local questions for ${category}`);
    return;
  }

  const tag = CATEGORY_TAGS[category] ?? 'javascript';

  try {
    const response = await axios.get('https://quizapi.io/api/v1/questions', {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { limit: 20, tags: tag, random: true },
    });

    // New API wraps results in response.data.data
    const raw = Array.isArray(response.data)
      ? response.data
      : (response.data?.data ?? []);

    if (!raw.length) {
      console.warn(`[QuizAPI] No questions returned for category "${category}" (tag: ${tag})`);
      return;
    }

    const parsed = raw.flatMap((q) => {
      // New format: answers is an array of { text, isCorrect }
      if (Array.isArray(q.answers)) {
        const options = q.answers.map((a) => a.text).filter(Boolean);
        const correctIndex = q.answers.findIndex((a) => a.isCorrect);
        if (options.length < 2 || correctIndex === -1) return [];
        return [{ id: String(q.id), text: q.text, options, correctAnswer: correctIndex }];
      }

      // Old format fallback: answers is an object { answer_a, answer_b, ... }
      if (q.answers && typeof q.answers === 'object') {
        const entries = Object.entries(q.answers).filter(([, v]) => v !== null);
        const correctKey = Object.keys(q.correct_answers ?? {}).find(
          (k) => q.correct_answers[k] === 'true'
        );
        if (!correctKey || entries.length < 2) return [];
        const baseKey = correctKey.replace('_correct', '');
        const correctIndex = entries.findIndex(([k]) => k === baseKey);
        if (correctIndex === -1) return [];
        return [{
          id: String(q.id),
          text: q.question,
          options: entries.map(([, v]) => v),
          correctAnswer: correctIndex,
        }];
      }

      return [];
    });

    if (parsed.length === 0) {
      console.warn(`[QuizAPI] Fetched questions for "${category}" but none were valid`);
      return;
    }

    // Merge into cache, no duplicates
    const existingIds = new Set(questionCache[category].map((q) => q.id));
    const fresh = parsed.filter((q) => !existingIds.has(q.id));
    questionCache[category] = [...questionCache[category], ...fresh];
    console.log(`[QuizAPI] +${fresh.length} questions for "${category}" (total: ${questionCache[category].length})`);
  } catch (err) {
    if (err.response?.status === 401) {
      console.error('[QuizAPI] 401 Unauthorized — generate a new key at https://quizapi.io (format: qz_live_...)');
    } else {
      console.error(`[QuizAPI] Failed to fetch "${category}":`, err.message);
    }
  }
};

const getRandomQuestion = async (category = 'Code', excludeId) => {
  // Fetch more if running low
  if (questionCache[category].length < 5) {
    await fetchQuestionsForCategory(category);
  }

  const pool = questionCache[category].length > 0
    ? questionCache[category]
    : questionCache['Code'];

  const available = excludeId ? pool.filter((q) => q.id !== excludeId) : pool;
  if (available.length === 0) return pool[0];

  return available[Math.floor(Math.random() * available.length)];
};

// Pre-warm cache on startup (non-blocking)
fetchQuestionsForCategory('Code');

module.exports = { getRandomQuestion };
