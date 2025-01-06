import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  ResponseSchema,
  SchemaType,
} from '@google/generative-ai';
import { AuthenticatedRequest } from 'src/auth/auth.guard';
import { TasksService } from 'src/tasks/tasks.service';
import { FocusSessionService } from 'src/focus-session/focus.service';

@Injectable()
export class LLMService {
  constructor(
    private configService: ConfigService,
    private taskService: TasksService,
    private sessionService: FocusSessionService,
  ) {}

  async provideInsight(request: AuthenticatedRequest): Promise<string> {
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
              description: 'Overall feedback on user study performance',
            },
            insights: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  rating: {
                    type: SchemaType.STRING,
                    format: 'enum',
                    enum: ['Great job', 'Good job', 'Can be improved'],
                    description: 'How good user has done',
                  },
                  insight: {
                    type: SchemaType.STRING,
                    description: '',
                    example:
                      'You are doing well! Keep up the good work to maintain consistent productivity.',
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
    Please analyze the following study tasks and provide insights in JSON format. 
    Make sure to use motivational and encouraging tone and each insight should be no longer than 40 words.
    `;

    try {
      const tasks = await this.taskService.getAll(request.user.username);

      const filteredTasks = tasks.filter((task) => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const date = task.endDate;

        return date && date >= oneWeekAgo && date <= today;
      });

      const stats = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        focusSessionsCompleted: 0,
        avgSessionDuration: 0, // minutes
        avgBreakTime: 0, // minutes
        totalTimeSpent: 0, // minutes
        totalEstimatedTime: 0, // minutes
        taskCompletionRate: 0, // percentage
      };

      const sessions = await this.sessionService.getAllFromUser(
        request.user._id,
      );

      sessions.filter((session) => {
        for (const task of filteredTasks) {
          if (task._id.equals(session.taskId)) {
            return true;
          }
        }
        return false;
      });

      if (tasks) {
        for (const task of tasks) {
          stats.totalTasks += 1;
          // f (task.status === "Todo") {}
          if (task.status === 'In Progress') {
            stats.inProgressTasks += 1;
          }
          if (task.status === 'Completed') {
            stats.completedTasks += 1;
          }
          if (task.status === 'Expired') {
            stats.overdueTasks += 1;
          }
          stats.avgSessionDuration += parseFloat(task.timeFocus);
        }

        if (stats.totalTasks !== 0) {
          stats.taskCompletionRate =
            (stats.completedTasks / stats.totalTasks) * 100;

          stats.avgSessionDuration =
            stats.avgSessionDuration / stats.totalTasks;
        }

        for (const session of sessions) {
          stats.focusSessionsCompleted += 1;
          stats.totalTimeSpent += session.breakTime + session.studyTime;
          stats.avgBreakTime += session.breakTime;
        }

        if (stats.focusSessionsCompleted !== 0) {
          stats.avgSessionDuration /= stats.focusSessionsCompleted;
          stats.avgBreakTime /= stats.focusSessionsCompleted;
        }
      }

      prompt +=
        '\n** User Input **\n' +
        JSON.stringify(filteredTasks) +
        '\n\n' +
        JSON.stringify(stats);
      const result = await model.generateContent(prompt);
      const response = JSON.parse(result.response.text());

      response.stats = stats;

      return response;
    } catch (error) {
      Logger.debug(error);
    }
    return "Can't get the response from AI right now.";
  }

  async suggestSchedule(request: AuthenticatedRequest): Promise<string> {
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
* Are the study goals for each session realistic and measurable? Provide examples of poorly defined goals and how to make them measurable.
* What are some potential strategies to improve focus and productivity, considering the student's learning preferences and challenges?

**IMPORTANT**
* Response to no more than 150 words total. Focus on key points.
* Each suggestion should be no more than 50 words or 3 sentences. Keep each point direct and avoid lengthy explanations.
* Provide separate suggestions for each distinct feedback point (e.g., time allocation, breaks, study goals, etc.). Do not combine multiple points into a single suggestion.
* Aim for 3-5 suggestions maximum. Each suggestion should address a unique issue or improvement.

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

    prompt += '\n** User Input **\n' + JSON.stringify(request.body);

    const result = await model.generateContent(prompt);

    return result.response.text();
  }
}
