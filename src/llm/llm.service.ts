import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  ResponseSchema,
  SchemaType,
} from '@google/generative-ai';
import { TasksService } from 'src/tasks/tasks.service';
import { AuthenticatedRequest } from 'src/auth/auth.guard';

@Injectable()
export class LLMService {
  constructor(
    private configService: ConfigService,
    private taskService: TasksService,
  ) {}

  async prioritySuggestion(request: AuthenticatedRequest): Promise<string> {
    const genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
    const model = genAI.getGenerativeModel({
      model: this.configService.get('GEMINI_MODEL'),
    });

    let prompt = `
    Please review the following study tasks and provide constructive feedback in JSON format. 
    Consider factors such as time allocation, balance between subjects, breaks, overall feasibility, 
    and alignment with the student's learning preferences. Strictly response in a Output JSON Format below that can be directly parsed.
    
    **Specific Questions to Address:**
    
    * Considering the estimated time and difficulty, is the time allocated to each subject appropriate given its workload?
    * Are sufficient breaks planned to prevent burnout?  Suggest specific break types and durations (e.g., 5-minute stretching break, 15-minute walk).
    * Does the schedule account for potential unexpected events or interruptions? Suggest strategies for handling them.
    * Are the study goals for each session realistic and measurable?  Provide examples of poorly defined goals and how to make them measurable (e.g., "Read Chapter 5" vs. "Read sections 5.1-5.3 of Chapter 5 and answer review questions 1-5").
    * What are some potential strategies to improve focus and productivity, considering the student's learning preferences and challenges?
    
    
    ** Output JSON Format (Example): **
    {
      "feedback": {
        "overall": "The schedule is ambitious but potentially manageable with some adjustments.",
        "suggestions": [
          {
            "task": "Caculus II Homework",
            "suggestion": "Task deadline is near, prioritize this task",
            "priority": "High"
          },
          {
            "suggestion": "Increase break time between subjects",
            "justification": "Allows for better mental processing and prevents burnout",
          }
        ]
      }
    }
    `;

    prompt += '\n** User Input **\n' + request.body;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
  }

  async scheduleSuggestion(request: AuthenticatedRequest): Promise<string> {
    const genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );

    const schema: ResponseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        feedback: {
          type: SchemaType.OBJECT,
          properties: {
            overall: {
              type: SchemaType.STRING,
              description: 'Overall feedback on the schedule',
            },
            suggestions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  suggestion: {
                    type: SchemaType.STRING,
                    description: 'Suggested change to the schedule',
                  },
                  reason: {
                    type: SchemaType.STRING,
                    description: 'Justification for the suggestion',
                  },
                },
              },
            },
          },
        },
      },
    };

    const model = genAI.getGenerativeModel({
      model: this.configService.get('GEMINI_MODEL'),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
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


** Output JSON Format (Example): **
{
  "feedback": {
    "overall": "The schedule is ambitious but potentially manageable with some adjustments.",
    "suggestions": [
      {
        "suggestion": "Move 'Chemistry Lab Report' to afternoon",
        "reason": "Avoids late-night study; aligns with higher energy levels earlier in the day"
      },
      {
        "suggestion": "Increase break time between subjects",
        "reason": "Allows for better mental processing and prevents burnout"
      }
    ]
  }
}
`;

    // const tasks = JSON.parse(request.body);
    // prompt += '\n** User Input **\n' + JSON.stringify(tasks);

    prompt += '\n** User Input **\n' + JSON.stringify(request.body);

    console.log(request.body);

    const result = await model.generateContent(prompt);

    console.log(result.response.text());

    return result.response.text();
  }
}
