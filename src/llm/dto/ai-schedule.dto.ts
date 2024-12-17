export interface AIScheduleDTO {
  student: {
    type: string;
    subjects: [string];
    learningChallenges: [string];
    learningStrengths: [string];
    preferredSessionLength: string;
    dailyCommitments: [{ activity: string; hoursPerWeek: number }];
    weeklyStudyTime: number;
  };
  schedule: [
    {
      day: string;
      time: string;
      subject: string;
      task: string;
      estimatedTime: number;
      difficulty: string;
      priority: string;
    },
  ];
}
