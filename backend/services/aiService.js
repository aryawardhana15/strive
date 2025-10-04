const axios = require('axios');

class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.googleAiApiKey = process.env.GOOGLE_AI_API_KEY;
    this.groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/v1';
    this.googleAiApiUrl = process.env.GOOGLE_AI_API_URL || 'https://generativelanguage.googleapis.com/v1';
  }

  // GROQ API Methods
  async generateQuiz(stepTitle, content) {
    if (!this.groqApiKey) {
      return this.getMockQuiz(stepTitle);
    }

    try {
      const prompt = `Generate a quiz for the learning step: "${stepTitle}"

Content: ${content}

Create 5-7 multiple choice questions with:
- Clear question text
- 4 answer options (A, B, C, D)
- Correct answer marked
- Brief explanation for correct answer

Return as JSON array with this structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Explanation for correct answer"
  }
]`;

      const response = await axios.post(
        `${this.groqApiUrl}/chat/completions`,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating quiz with GROQ:', error.message);
      return this.getMockQuiz(stepTitle);
    }
  }

  async evaluateCode(challengeTitle, userCode, language) {
    if (!this.groqApiKey) {
      return this.getMockCodeEvaluation();
    }

    try {
      const prompt = `Evaluate this ${language} code for the challenge: "${challengeTitle}"

User Code:
\`\`\`${language}
${userCode}
\`\`\`

Provide evaluation as JSON:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "Detailed feedback",
  "hints": ["Hint 1", "Hint 2"] (if failed)
}`;

      const response = await axios.post(
        `${this.groqApiUrl}/chat/completions`,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error evaluating code with GROQ:', error.message);
      return this.getMockCodeEvaluation();
    }
  }

  async matchSkillsToJobs(userSkills) {
    if (!this.groqApiKey) {
      return this.getMockJobMatches(userSkills);
    }

    try {
      const skillsText = userSkills.map(skill => `${skill.name} (${skill.level})`).join(', ');
      
      const prompt = `Match these user skills to job opportunities:

User Skills: ${skillsText}

Return job recommendations as JSON array:
[
  {
    "job_id": 1,
    "score": 85.5,
    "reason": "Strong match with React and JavaScript skills"
  }
]

Consider:
- Skill level (beginner/intermediate/advanced/expert)
- Skill relevance to job requirements
- Score 0-100 based on match quality`;

      const response = await axios.post(
        `${this.groqApiUrl}/chat/completions`,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error matching skills to jobs with GROQ:', error.message);
      return this.getMockJobMatches(userSkills);
    }
  }

  // Google AI Studio Methods
  async analyzeCV(cvText) {
    if (!this.googleAiApiKey) {
      return this.getMockCVAnalysis();
    }

    try {
      const prompt = `Analyze this CV and provide feedback:

${cvText}

Provide analysis as JSON:
{
  "score": 75,
  "strengths": ["Strong technical skills", "Good project experience"],
  "weaknesses": ["Limited work experience", "Missing certifications"],
  "suggestions": ["Add more specific achievements", "Include relevant certifications"],
  "overall_feedback": "Good foundation but needs improvement in certain areas"
}`;

      const response = await axios.post(
        `${this.googleAiApiUrl}/models/gemini-pro:generateContent?key=${this.googleAiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing CV with Google AI:', error.message);
      return this.getMockCVAnalysis();
    }
  }

  // Mock Data Methods (fallback when API keys are missing)
  getMockQuiz(stepTitle) {
    return [
      {
        question: `What is the main purpose of ${stepTitle}?`,
        options: [
          "To improve performance",
          "To enhance user experience", 
          "To reduce complexity",
          "To increase security"
        ],
        correct: 1,
        explanation: "The main purpose is to enhance user experience through better design and functionality."
      },
      {
        question: `Which of the following is NOT a benefit of ${stepTitle}?`,
        options: [
          "Better maintainability",
          "Improved scalability",
          "Increased complexity",
          "Enhanced readability"
        ],
        correct: 2,
        explanation: "Increased complexity is not a benefit, it's usually something we want to avoid."
      },
      {
        question: `What should you consider when implementing ${stepTitle}?`,
        options: [
          "Only performance",
          "Only security",
          "Multiple factors including performance, security, and maintainability",
          "Only user interface"
        ],
        correct: 2,
        explanation: "You should consider multiple factors to create a well-rounded solution."
      }
    ];
  }

  getMockCodeEvaluation() {
    return {
      passed: Math.random() > 0.3, // 70% pass rate
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      feedback: "Your code shows good understanding of the concepts. Consider optimizing the algorithm for better performance.",
      hints: ["Try using a more efficient data structure", "Consider edge cases in your solution"]
    };
  }

  getMockJobMatches(userSkills) {
    const mockJobs = [
      { job_id: 1, score: 85.5, reason: "Strong match with React and JavaScript skills" },
      { job_id: 2, score: 78.2, reason: "Good Python and data science background" },
      { job_id: 3, score: 72.1, reason: "Relevant web development experience" }
    ];

    return mockJobs.slice(0, Math.min(3, userSkills.length));
  }

  getMockCVAnalysis() {
    return {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      strengths: [
        "Strong technical skills in relevant technologies",
        "Good project experience and portfolio",
        "Clear communication of achievements"
      ],
      weaknesses: [
        "Could benefit from more specific metrics",
        "Consider adding relevant certifications",
        "Work experience could be more detailed"
      ],
      suggestions: [
        "Add specific numbers and metrics to achievements",
        "Include relevant certifications and courses",
        "Expand on technical skills and tools used"
      ],
      overall_feedback: "This is a solid CV with good technical foundation. Focus on adding more specific achievements and metrics to make it stand out."
    };
  }
}

module.exports = new AIService();







