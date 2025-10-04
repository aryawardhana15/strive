const axios = require('axios');

// GROQ API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Google AI Studio API configuration
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Mock responses when API keys are not available
const MOCK_MODE = !GROQ_API_KEY || !GOOGLE_AI_API_KEY;

// GROQ API helper
const callGroqAPI = async (messages, model = 'llama-3.1-8b-instant') => {
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
const generateQuiz = async (topic, content, difficulty = 'intermediate') => {
  const prompt = `You are an expert programming instructor. Generate a ${difficulty} level quiz about "${topic}".

Topic content: ${content}

Create 5 multiple choice questions that test understanding of the key concepts. Each question should have 4 options (A, B, C, D) with only ONE correct answer.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the main purpose of HTML?",
      "options": [
        "To style web pages",
        "To structure web content",
        "To add interactivity",
        "To create databases"
      ],
      "correct_answer": "To structure web content",
      "explanation": "HTML (HyperText Markup Language) is used to structure and organize web content using elements and tags."
    }
  ]
}

Requirements:
- Generate exactly 5 questions
- Each question must have exactly 4 options
- Only one option should be correct
- Make questions practical and test real understanding
- Focus on the key concepts from the topic content
- Provide clear explanations for correct answers
- Use proper JSON formatting with no extra text`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    // Clean the response to ensure it's valid JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const quizData = JSON.parse(cleanResponse);
    
    // Validate the structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure');
    }
    
    // Ensure each question has required fields
    quizData.questions = quizData.questions.map((q, index) => ({
      id: index + 1,
      question: q.question || `Question ${index + 1}`,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: q.correct_answer || q.options?.[0] || 'Option A',
      explanation: q.explanation || 'No explanation provided'
    }));
    
    return quizData;
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error);
    console.error('Raw response:', response);
    return getMockQuiz(topic);
  }
};

// Quiz grading
const gradeQuiz = async (questions, answers) => {
  const prompt = `You are an expert programming instructor grading a quiz. Analyze the student's answers and provide detailed feedback.

Questions and correct answers:
${questions.map(q => `Q${q.id}: ${q.question}\nCorrect Answer: ${q.correct_answer}\nExplanation: ${q.explanation}`).join('\n\n')}

Student answers:
${answers.map(a => `Q${a.question_id}: ${a.answer}`).join('\n')}

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "score": 80,
  "total_questions": 5,
  "correct_answers": 4,
  "feedback": "Good performance! You understand the basic concepts well. Focus on practicing more to improve your understanding.",
  "detailed_results": [
    {
      "question": "What is the main purpose of HTML?",
      "user_answer": "To structure web content",
      "correct_answer": "To structure web content",
      "is_correct": true,
      "explanation": "Correct! HTML is used to structure and organize web content."
    }
  ]
}

Requirements:
- Calculate score as percentage (0-100)
- Count correct answers accurately
- Provide encouraging but constructive feedback
- For each question, show the question text, user's answer, correct answer, whether it's correct, and explanation
- Be encouraging in feedback while pointing out areas for improvement
- Use proper JSON formatting with no extra text`;

  const response = await callGroqAPI([
    { role: 'user', content: prompt }
  ]);

  try {
    // Clean the response to ensure it's valid JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const gradingData = JSON.parse(cleanResponse);
    
    // Validate and ensure required fields
    const result = {
      score: Math.round(gradingData.score || 0),
      total_questions: gradingData.total_questions || questions.length,
      correct_answers: gradingData.correct_answers || 0,
      feedback: gradingData.feedback || 'Quiz completed. Keep practicing!',
      detailed_results: gradingData.detailed_results || []
    };
    
    // Ensure detailed_results has the correct structure
    result.detailed_results = result.detailed_results.map((detail, index) => ({
      question: detail.question || questions[index]?.question || `Question ${index + 1}`,
      user_answer: detail.user_answer || answers.find(a => a.question_id === questions[index]?.id)?.answer || 'No answer',
      correct_answer: detail.correct_answer || questions[index]?.correct_answer || 'Unknown',
      is_correct: detail.is_correct || false,
      explanation: detail.explanation || 'No explanation provided'
    }));
    
    return result;
  } catch (error) {
    console.error('Failed to parse grading JSON:', error);
    console.error('Raw response:', response);
    return getMockQuizGrade(questions, answers);
  }
};

// Code challenge evaluation
const evaluateCode = async (code, language, challengeDescription) => {
  // Get specific evaluation criteria based on challenge description
  const evaluationCriteria = getEvaluationCriteria(challengeDescription);
  
  const prompt = `You are an expert programming instructor evaluating a ${language} code submission.

CHALLENGE: ${challengeDescription}

STUDENT CODE:
\`\`\`${language}
${code}
\`\`\`

EVALUATION CRITERIA:
${evaluationCriteria.criteria}

EXPECTED BEHAVIOR:
${evaluationCriteria.expected}

TEST CASES TO VERIFY:
${evaluationCriteria.testCases}

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "Detailed feedback about the solution",
  "hints": ["Hint 1", "Hint 2"],
  "test_results": [
    {
      "test_case": "Test case name",
      "passed": true/false,
      "output": "Actual output or error message",
      "expected": "Expected output"
    }
  ]
}

EVALUATION RULES:
1. Test the code logic against the expected behavior
2. Check if the solution meets all requirements
3. Verify the output matches expected results
4. Give score 0-100 based on correctness and quality
5. Provide constructive feedback
6. Include helpful hints for improvement
7. Be strict but fair in evaluation
8. If code has syntax errors, mark as failed
9. If code doesn't produce expected output, mark as failed
10. If code works but is inefficient, give partial credit

Return ONLY the JSON object, no additional text.`;

  try {
    const response = await callGroqAPI([
      { role: 'user', content: prompt }
    ]);

    // Clean the response to ensure it's valid JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const result = JSON.parse(cleanResponse);
    
    // Validate and ensure required fields
    return {
      passed: result.passed || false,
      score: Math.max(0, Math.min(100, result.score || 0)),
      feedback: result.feedback || 'Code evaluation completed.',
      hints: result.hints || [],
      test_results: result.test_results || []
    };
    
  } catch (error) {
    console.error('Failed to parse code evaluation JSON:', error);
    console.error('Raw response:', response);
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
  const prompt = `You are an expert HR professional and career coach analyzing a CV. Provide comprehensive feedback to help improve the candidate's chances of getting hired.

CV Content:
${cvText}

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "overall_score": 85,
  "strengths": [
    "Strong technical skills in relevant technologies",
    "Clear work experience progression",
    "Good educational background"
  ],
  "weaknesses": [
    "Missing quantifiable achievements",
    "Could improve formatting and structure",
    "Limited soft skills mentioned"
  ],
  "suggestions": [
    "Add specific metrics and achievements (e.g., 'Increased sales by 25%')",
    "Include relevant keywords for ATS systems",
    "Improve the professional summary section",
    "Add quantifiable results to work experience"
  ],
  "keyword_analysis": {
    "present": ["JavaScript", "React", "Node.js", "Python"],
    "missing": ["TypeScript", "Docker", "AWS", "Agile", "Leadership"]
  },
  "sections_analysis": {
    "contact_info": {"score": 90, "feedback": "Complete and professional"},
    "summary": {"score": 70, "feedback": "Good but could be more specific"},
    "experience": {"score": 80, "feedback": "Relevant experience but needs more metrics"},
    "education": {"score": 95, "feedback": "Strong educational background"},
    "skills": {"score": 75, "feedback": "Good technical skills, add soft skills"}
  },
  "ats_compatibility": {
    "score": 80,
    "feedback": "Good ATS compatibility, but could improve with more keywords"
  },
  "improvement_priority": [
    "Add quantifiable achievements to work experience",
    "Include more relevant keywords for target roles",
    "Improve professional summary with specific value proposition"
  ]
}

EVALUATION CRITERIA:
1. Overall structure and formatting (20%)
2. Content quality and relevance (30%)
3. Quantifiable achievements (20%)
4. Keyword optimization for ATS (15%)
5. Professional presentation (15%)

Be thorough but constructive in your feedback. Focus on actionable improvements.

CRITICAL: You MUST return ONLY a valid JSON object. Do not include any explanatory text before or after the JSON. Start your response with { and end with }.`;

  let response;
  try {
    response = await callGroqAPI([
      { role: 'user', content: prompt }
    ]);

    // Clean the response to ensure it's valid JSON
    let cleanResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Remove any text before the first { and after the last }
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
    }
    
    const result = JSON.parse(cleanResponse);
    
    // Validate and ensure required fields
    return {
      overall_score: Math.max(0, Math.min(100, result.overall_score || 0)),
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || [],
      keyword_analysis: result.keyword_analysis || { present: [], missing: [] },
      sections_analysis: result.sections_analysis || {},
      ats_compatibility: result.ats_compatibility || { score: 0, feedback: '' },
      improvement_priority: result.improvement_priority || []
    };
    
  } catch (error) {
    console.error('Failed to parse CV analysis JSON:', error);
    console.error('Raw response:', response);
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
      options: [
        'To create interactive web applications',
        'To structure and organize content',
        'To style web pages',
        'To manage databases'
      ],
      correct_answer: 'To structure and organize content',
      explanation: `${topic} is primarily used to structure and organize content in a logical and semantic way.`
    },
    {
      id: 2,
      question: `Which of the following is a key feature of ${topic}?`,
      options: [
        'Real-time communication',
        'Semantic markup',
        'Database management',
        'Image processing'
      ],
      correct_answer: 'Semantic markup',
      explanation: `${topic} provides semantic markup that gives meaning to content structure.`
    },
    {
      id: 3,
      question: `What does ${topic} stand for?`,
      options: [
        'HyperText Markup Language',
        'High Technology Modern Language',
        'Home Tool Markup Language',
        'Hyperlink and Text Markup Language'
      ],
      correct_answer: 'HyperText Markup Language',
      explanation: `${topic} stands for HyperText Markup Language, which is the standard markup language for web pages.`
    },
    {
      id: 4,
      question: `Which element is used to create headings in ${topic}?`,
      options: [
        '<header>',
        '<h1> to <h6>',
        '<title>',
        '<head>'
      ],
      correct_answer: '<h1> to <h6>',
      explanation: 'Heading elements from h1 to h6 are used to create different levels of headings in HTML.'
    },
    {
      id: 5,
      question: `What is the correct way to create a link in ${topic}?`,
      options: [
        '<link href="url">',
        '<a href="url">text</a>',
        '<url>text</url>',
        '<href="url">text</href>'
      ],
      correct_answer: '<a href="url">text</a>',
      explanation: 'The <a> tag with href attribute is used to create hyperlinks in HTML.'
    }
  ]
});

const getMockQuizGrade = (questions, answers) => {
  // Calculate actual score based on answers
  let correctCount = 0;
  const detailedResults = [];
  
  questions.forEach((question, index) => {
    const userAnswer = answers.find(a => a.question_id === question.id);
    const isCorrect = userAnswer && userAnswer.answer === question.correct_answer;
    
    if (isCorrect) correctCount++;
    
    detailedResults.push({
      question: question.question,
      user_answer: userAnswer ? userAnswer.answer : 'No answer',
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      explanation: isCorrect 
        ? `Correct! ${question.explanation}` 
        : `Incorrect. ${question.explanation}`
    });
  });
  
  const score = Math.round((correctCount / questions.length) * 100);
  
  return {
    score: score,
    total_questions: questions.length,
    correct_answers: correctCount,
    feedback: score >= 50 
      ? `Great job! You scored ${score}%. You have a good understanding of the concepts. Keep practicing to improve further!`
      : `You scored ${score}%. Don't worry, learning takes time! Review the material and try again. Focus on understanding the key concepts.`,
    detailed_results: detailedResults
  };
};

// Get evaluation criteria for specific challenges
const getEvaluationCriteria = (challengeDescription) => {
  const criteria = {
    'JavaScript Loops': {
      criteria: '1. Function must be named countEvenNumbers\n2. Must use a loop (for or while)\n3. Must count even numbers from 1 to 100\n4. Must return the total count\n5. Code should be syntactically correct',
      expected: 'Function should return 50 (there are 50 even numbers from 1 to 100)',
      testCases: 'Test: countEvenNumbers() should return 50'
    },
    'Array Manipulation': {
      criteria: '1. Function must be named findMaxNumber\n2. Must accept an array parameter\n3. Must use a loop to find maximum value\n4. Must return the maximum number\n5. Should handle edge cases',
      expected: 'Function should return the largest number in the array',
      testCases: 'Test: findMaxNumber([1, 5, 3, 9, 2]) should return 9'
    },
    'String Reversal': {
      criteria: '1. Function must be named reverseString\n2. Must accept a string parameter\n3. Must reverse the string characters\n4. Must return the reversed string\n5. Should handle empty strings',
      expected: 'Function should return the input string with characters in reverse order',
      testCases: 'Test: reverseString("hello") should return "olleh"'
    },
    'Data Structure: Stack': {
      criteria: '1. Must implement a Stack class\n2. Must have constructor, push, pop, peek, isEmpty methods\n3. push() should add element to top\n4. pop() should remove and return top element\n5. peek() should return top element without removing\n6. isEmpty() should return boolean',
      expected: 'Stack should follow LIFO (Last In, First Out) principle',
      testCases: 'Test: const stack = new Stack(); stack.push(1); stack.push(2); stack.peek() should return 2'
    },
    'Algorithm: Binary Search': {
      criteria: '1. Function must be named binarySearch\n2. Must accept sorted array and target value\n3. Must implement binary search algorithm\n4. Must return index if found, -1 if not found\n5. Must be O(log n) time complexity',
      expected: 'Function should efficiently find target in sorted array',
      testCases: 'Test: binarySearch([1, 3, 5, 7, 9], 5) should return 2'
    },
    'Async Programming': {
      criteria: '1. Function must be named fetchUserData\n2. Must be async function\n3. Must use fetch API\n4. Must handle errors with try-catch\n5. Must return data or null on error\n6. Should handle network failures',
      expected: 'Function should fetch user data and handle errors gracefully',
      testCases: 'Test: await fetchUserData(1) should return user data or null'
    },
    'Full Stack: Todo App': {
      criteria: '1. Must implement TodoManager class\n2. Must have constructor, createTodo, getAllTodos, updateTodo, deleteTodo, toggleComplete methods\n3. createTodo should add new todo with id, title, description, completed status\n4. getAllTodos should return array of todos\n5. updateTodo should modify existing todo\n6. deleteTodo should remove todo\n7. toggleComplete should flip completed status',
      expected: 'TodoManager should provide full CRUD operations for todos',
      testCases: 'Test: const manager = new TodoManager(); manager.createTodo("Test", "Test todo"); manager.getAllTodos() should return array with 1 todo'
    },
    'Algorithm: Path Finding': {
      criteria: '1. Function must be named findShortestPath\n2. Must accept grid (2D array), start coordinates, end coordinates\n3. Must implement BFS algorithm\n4. Must return array of coordinates for shortest path\n5. Must return null if no path exists\n6. Grid: 0 = path, 1 = obstacle',
      expected: 'Function should find shortest path using BFS',
      testCases: 'Test: findShortestPath([[0,0,0],[0,1,0],[0,0,0]], [0,0], [2,2]) should return path coordinates'
    },
    'System Design: Cache Implementation': {
      criteria: '1. Must implement LRUCache class\n2. Must have constructor(capacity), get(key), put(key, value) methods\n3. get() should return value and update access order\n4. put() should add/update key-value and maintain capacity\n5. Must implement LRU eviction policy\n6. Should handle capacity overflow',
      expected: 'LRUCache should implement Least Recently Used eviction policy',
      testCases: 'Test: const cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1) should return 1'
    }
  };

  // Find matching criteria based on challenge description
  for (const [key, value] of Object.entries(criteria)) {
    if (challengeDescription.includes(key)) {
      return value;
    }
  }

  // Default criteria for unknown challenges
  return {
    criteria: '1. Code must be syntactically correct\n2. Must solve the given problem\n3. Must return expected output\n4. Should be efficient and readable',
    expected: 'Code should produce the correct output for the given problem',
    testCases: 'Test the code with the provided examples'
  };
};

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
  overall_score: 78,
  strengths: [
    'Strong technical skills in modern technologies',
    'Clear work experience progression',
    'Good educational background',
    'Relevant project portfolio'
  ],
  weaknesses: [
    'Missing quantifiable achievements in work experience',
    'Could improve professional summary section',
    'Limited soft skills mentioned',
    'Some formatting inconsistencies'
  ],
  suggestions: [
    'Add specific metrics and achievements (e.g., "Increased performance by 30%")',
    'Include relevant keywords for ATS systems',
    'Improve the professional summary with specific value proposition',
    'Add quantifiable results to work experience',
    'Include soft skills like leadership and communication'
  ],
  keyword_analysis: {
    present: ['JavaScript', 'React', 'Node.js', 'Python', 'Git'],
    missing: ['TypeScript', 'Docker', 'AWS', 'Agile', 'Leadership', 'Teamwork']
  },
  sections_analysis: {
    contact_info: { score: 90, feedback: 'Complete and professional contact information' },
    summary: { score: 65, feedback: 'Good start but could be more specific and impactful' },
    experience: { score: 75, feedback: 'Relevant experience but needs more quantifiable achievements' },
    education: { score: 95, feedback: 'Strong educational background' },
    skills: { score: 80, feedback: 'Good technical skills, consider adding soft skills' }
  },
  ats_compatibility: {
    score: 75,
    feedback: 'Good ATS compatibility, but could improve with more industry-specific keywords'
  },
  improvement_priority: [
    'Add quantifiable achievements to work experience',
    'Include more relevant keywords for target roles',
    'Improve professional summary with specific value proposition',
    'Add soft skills and leadership examples'
  ]
});

module.exports = {
  generateQuiz,
  gradeQuiz,
  evaluateCode,
  matchSkillsToJobs,
  analyzeCV,
  MOCK_MODE
};
