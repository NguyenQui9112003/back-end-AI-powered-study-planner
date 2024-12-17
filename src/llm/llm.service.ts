import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIScheduleDTO } from './dto/ai-schedule.dto';

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) {}

  async generateText(data: AIScheduleDTO): Promise<string> {
    const genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
    const model = genAI.getGenerativeModel({
      model: this.configService.get('GEMINI_MODEL'),
    });

    let prompt = `
Please review the following study schedule and provide constructive feedback in JSON format. 
Consider factors such as time allocation, balance between subjects, breaks, overall feasibility, 
and alignment with the student's learning preferences. Identify potential bottlenecks and suggest 
improvements for optimization.

**Specific Questions to Address:**

* Considering the estimated time and difficulty, is the time allocated to each subject appropriate given its workload?
* Are sufficient breaks planned to prevent burnout?  Suggest specific break types and durations (e.g., 5-minute stretching break, 15-minute walk).
* Does the schedule account for potential unexpected events or interruptions? Suggest strategies for handling them.
* Are the study goals for each session realistic and measurable?  Provide examples of poorly defined goals and how to make them measurable (e.g., "Read Chapter 5" vs. "Read sections 5.1-5.3 of Chapter 5 and answer review questions 1-5").
* What are some potential strategies to improve focus and productivity, considering the student's learning preferences and challenges?

**Input JSON Format (Example): **
{
  "student": {
    "type": "Second-year undergraduate student",  // Be specific!
    "subjects": [ "Calculus I", "History 101" ],
    "learningChallenges": ["Difficulty with memorization"],
    "learningStrengths": ["Strong analytical skills"],
    "preferredSessionLength": "Short bursts (Pomodoro Technique)",
    "dailyCommitments": [
      {"activity": "Part-time job", "hoursPerWeek": 10},
      {"activity": "Sports practice", "hoursPerWeek": 3}
    ],
    "weeklyStudyTime": 20 //Total hours available per week
  },
  "schedule": [
    {
      "day": "Monday",
      "time": "09:00-10:30",
      "subject": "Calculus I",
      "task": "Review Chapter 3",
      "estimatedTime": 90,
      "difficulty": "Medium"
    },
    {
      "day": "Monday",
      "time": "10:30-11:00",
      "subject": "Break",
      "task": "Short Break",
      "estimatedTime": 30,
      "difficulty": "N/A"
    },
  ]
}

** Output JSON Format (Example): **
{
  "feedback": {
    "overall": "The schedule is ambitious but potentially manageable with some adjustments.",
    "suggestions": [
      {
        "suggestion": "Move 'Chemistry Lab Report' to afternoon",
        "justification": "Avoids late-night study; aligns with higher energy levels earlier in the day",
        "impact": "Improved focus, reduced likelihood of errors"
      },
      {
        "suggestion": "Increase break time between subjects",
        "justification": "Allows for better mental processing and prevents burnout",
        "impact": "Improved focus and retention"
      }
    ]
  }
}
`;
    prompt += '\n** User Input **\n' + JSON.stringify(data);

    const result = await model.generateContent(prompt);
    // console.log(result.response.text());
    return result.response.text();
  }
}
