const axios = require('axios');

// GROQ API configuration
const GROQ_API_URL = 'https://api.groq.com/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Google AI Studio API configuration
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Mock responses when API keys are not available
const MOCK_MODE = !GROQ_API_KEY || !GOOGLE_AI_API_KEY;

// GROQ API helper
const callGroqAPI = async (messages, model = 'llama3-8b-8192') => {
  if (MOCK_MODE) {
    console.log('🤖 Mock mode: GROQ API key not provided');
    return getMockGroqResponse(messages);
  }

  try {
    const response = await axios.post(`${GROQ_API_URL}/chat/completions`, {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GROQ API Error:', error.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
};

// Google AI Studio API helper
const callGoogleAI = async (prompt, model = 'gemini-pro') => {
  if (MOCK_MODE) {
    console.log('🤖 Mock mode: Google AI API key not provided');
    return getMockGoogleAIResponse(prompt);
  }

  try {
    const response = await axios.post(`${GOOGLE_AI_API_URL}/models/${model}:generateContent`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        key: GOOGLE_AI_API_KEY
      }
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Google AI API Error:', error.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
};

// Quiz generation
const generateQuiz = async (topic, difficulty = 'intermediate') => {
  const prompt = `Generate a ${difficulty} level quiz about ${topic}. 
  Return a JSON object with this structure:
  {
    "questions": [
      {
        "id": 1,
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "explanation": "Explanation of the correct answer"
      }
    ]
  }
  Generate 5-7 questions. Make them practical and relevant to real-world scenarios.`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error);
    return getMockQuiz(topic);
  }
};

// Quiz grading
const gradeQuiz = async (questions, answers) => {
  const prompt = `Grade this quiz submission. 
  
  Questions and correct answers:
  ${questions.map(q => `Q${q.id}: ${q.question}\nCorrect: ${q.correct_answer}`).join('\n')}
  
  Student answers:
  ${answers.map(a => `Q${a.question_id}: ${a.answer}`).join('\n')}
  
  Return a JSON object:
  {
    "score": 85,
    "total_questions": 5,
    "correct_answers": 4,
    "feedback": "Overall good performance. Focus on understanding async/await concepts.",
    "detailed_results": [
      {
        "question_id": 1,
        "correct": true,
        "explanation": "Correct! This demonstrates proper understanding."
      }
    ]
  }`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse grading JSON:', error);
    return getMockQuizGrade(questions, answers);
  }
};

// Code challenge evaluation
const evaluateCode = async (code, language, challengeDescription) => {
  const prompt = `Evaluate this ${language} code for the challenge: "${challengeDescription}"
  
  Code:
  \`\`\`${language}
  ${code}
  \`\`\`
  
  Return a JSON object:
  {
    "passed": true,
    "score": 90,
    "feedback": "Good solution! The code is efficient and handles edge cases well.",
    "hints": ["Consider adding input validation", "Try to optimize the time complexity"],
    "test_results": [
      {
        "test_case": "Basic functionality",
        "passed": true,
        "output": "Expected output"
      }
    ]
  }`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse code evaluation JSON:', error);
    return getMockCodeEvaluation(code, language);
  }
};

// Skill-Job matching
const matchSkillsToJobs = async (userSkills, availableJobs) => {
  const skillsText = userSkills.map(skill => `${skill.name} (${skill.level})`).join(', ');
  const jobsText = availableJobs.map(job => `${job.title} at ${job.company}: ${job.requirements}`).join('\n');

  const prompt = `Match user skills to available jobs and provide recommendations.
  
  User Skills: ${skillsText}
  
  Available Jobs:
  ${jobsText}
  
  Return a JSON array of recommendations:
  [
    {
      "job_id": 1,
      "score": 85,
      "reason": "Strong match in React and JavaScript skills. Frontend development experience aligns well with requirements."
    }
  ]
  
  Score should be 0-100 based on skill alignment.`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse job matching JSON:', error);
    return getMockJobRecommendations(userSkills, availableJobs);
  }
};

// CV Analysis
const analyzeCV = async (cvText) => {
  const prompt = `Analyze this CV and provide feedback for improvement.
  
  CV Content:
  ${cvText}
  
  Return a JSON object:
  {
    "overall_score": 75,
    "strengths": ["Strong technical skills", "Relevant experience"],
    "weaknesses": ["Missing quantifiable achievements", "Could improve formatting"],
    "suggestions": [
      "Add specific metrics and achievements",
      "Include relevant keywords for ATS systems",
      "Improve the summary section"
    ],
    "keyword_analysis": {
      "present": ["JavaScript", "React", "Node.js"],
      "missing": ["TypeScript", "Docker", "AWS"]
    }
  }`;

  const response = await callGoogleAI(prompt);

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse CV analysis JSON:', error);
    return getMockCVAnalysis(cvText);
  }
};

// Mock responses for development/testing
const getMockGroqResponse = (messages) => {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  if (lastMessage.includes('quiz')) {
    return JSON.stringify(getMockQuiz('JavaScript'));
  } else if (lastMessage.includes('grade')) {
    return JSON.stringify(getMockQuizGrade([], []));
  } else if (lastMessage.includes('code')) {
    return JSON.stringify(getMockCodeEvaluation('', 'javascript'));
  } else if (lastMessage.includes('match')) {
    return JSON.stringify(getMockJobRecommendations([], []));
  }
  
  return 'Mock AI response';
};

const getMockGoogleAIResponse = (prompt) => {
  if (prompt.includes('CV') || prompt.includes('resume')) {
    return JSON.stringify(getMockCVAnalysis(''));
  }
  return 'Mock Google AI response';
};

const getMockQuiz = (topic) => ({
  questions: [
    {
      id: 1,
      question: `What is the main purpose of ${topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      explanation: 'This is the correct answer because...'
    },
    {
      id: 2,
      question: `Which of the following is NOT related to ${topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option C',
      explanation: 'This option is not related to the topic.'
    }
  ]
});

const getMockQuizGrade = (questions, answers) => ({
  score: 80,
  total_questions: 5,
  correct_answers: 4,
  feedback: 'Good performance! Keep practicing to improve your understanding.',
  detailed_results: [
    {
      question_id: 1,
      correct: true,
      explanation: 'Correct answer!'
    }
  ]
});

const getMockCodeEvaluation = (code, language) => ({
  passed: true,
  score: 85,
  feedback: 'Good solution! The code works correctly.',
  hints: ['Consider adding error handling', 'Try to optimize the solution'],
  test_results: [
    {
      test_case: 'Basic functionality',
      passed: true,
      output: 'Expected output'
    }
  ]
});

const getMockJobRecommendations = (userSkills, availableJobs) => [
  {
    job_id: 1,
    score: 85,
    reason: 'Strong match based on your technical skills and experience level.'
  },
  {
    job_id: 2,
    score: 70,
    reason: 'Good alignment with your background, some additional learning recommended.'
  }
];

const getMockCVAnalysis = (cvText) => ({
  overall_score: 75,
  strengths: ['Strong technical skills', 'Relevant project experience'],
  weaknesses: ['Could add more quantifiable achievements', 'Missing some industry keywords'],
  suggestions: [
    'Add specific metrics and achievements',
    'Include relevant keywords for ATS systems',
    'Improve the professional summary'
  ],
  keyword_analysis: {
    present: ['JavaScript', 'React', 'Node.js'],
    missing: ['TypeScript', 'Docker', 'AWS']
  }
});

module.exports = {
  generateQuiz,
  gradeQuiz,
  evaluateCode,
  matchSkillsToJobs,
  analyzeCV,
  MOCK_MODE
};
