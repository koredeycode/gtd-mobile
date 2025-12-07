
export const USERS = [
  {
    id: "u1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
  },
];

export const CATEGORIES = [
  {
    id: "c1",
    name: "Work",
    color: "#39FF14", // Neon Green
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "c2",
    name: "Mind",
    color: "#FF007A", // Neon Pink
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "c3",
    name: "Finance",
    color: "#FFFF00", // Yellow
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "c4",
    name: "Health", // Body
    color: "#00E0FF", // Cyan
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "c5",
    name: "Social",
    color: "#AF52DE", // Purple
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "c6",
    name: "Growth",
    color: "#FF9900", // Orange
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2023-12-01T10:00:00Z",
  },
];

export const HABITS = [
  // Mind
  {
    id: "h1",
    user_id: "u1",
    category_id: "c2",
    title: "Meditate Daily",
    frequency_json: { type: "daily" },
    streak: 7, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  {
    id: "h2",
    user_id: "u1",
    category_id: "c2",
    title: "Journaling",
    frequency_json: { type: "daily" },
    streak: 3, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  // Health (Body)
  {
    id: "h3",
    user_id: "u1",
    category_id: "c4",
    title: "Workout 3x/week",
    frequency_json: { type: "weekly", days: 3 },
    streak: 21, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  {
    id: "h4",
    user_id: "u1",
    category_id: "c4",
    title: "Drink 2L Water",
    frequency_json: { type: "daily" },
    streak: 88, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  // Growth
  {
    id: "h5",
    user_id: "u1",
    category_id: "c6",
    title: "Read 10 pages",
    frequency_json: { type: "daily" },
    streak: 14, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  {
    id: "h6",
    user_id: "u1",
    category_id: "c6",
    title: "Code for 1 hour",
    frequency_json: { type: "daily" },
    streak: 52, // Mock field for UI
    updated_at: "2023-12-04T08:00:00Z",
  },
  // Archived
  {
    id: "h101",
    user_id: "u1",
    category_id: "c2", // Assuming
    title: "Finish Novel",
    frequency_json: { type: "daily" },
    streak: 0,
    updated_at: "2023-12-04T08:00:00Z",
    deleted_at: "2023-12-05T08:00:00Z", // Mark as archived/deleted
  },
  {
    id: "h102",
    user_id: "u1",
    category_id: "c6", // Assuming
    title: "Learn Guitar",
    frequency_json: { type: "daily" },
    streak: 0,
    updated_at: "2023-12-04T08:00:00Z",
    deleted_at: "2023-12-05T08:00:00Z",
  },
    {
    id: "h103",
    user_id: "u1",
    category_id: "c4", // Assuming
    title: "Run a 5K",
    frequency_json: { type: "daily" },
    streak: 0,
    updated_at: "2023-12-04T08:00:00Z",
    deleted_at: "2023-12-05T08:00:00Z",
  },
  {
    id: "h104",
    user_id: "u1",
    category_id: "c3", // Finance
    title: "Save $1000",
    frequency_json: { type: "daily" },
    streak: 0,
    updated_at: "2023-12-04T08:00:00Z",
    deleted_at: "2023-12-05T08:00:00Z",
  },
];

// Helper to generate logs
const generateLogs = () => {
  const logs: any[] = [];
  const today = new Date();
  
  const sampleTexts = [
      "Felt energetic!", "Tired but pushed through.", "Best session this week!", 
      "Need to improve form.", "Quick and dirty.", "Focused.", "Distracted but done."
  ];

  HABITS.forEach(habit => {
    // Determine a random "consistency" for this habit (0.3 to 0.9)
    let consistency = 0.5;
    if (habit.id === 'h1') consistency = 0.9;
    if (habit.id === 'h3') consistency = 0.4;
    if (habit.id === 'h4') consistency = 0.8;
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (Math.random() < consistency) {
            logs.push({
                id: `l_${habit.id}_${i}`,
                habit_id: habit.id,
                user_id: habit.user_id,
                date: dateStr,
                value: true,
                text: Math.random() > 0.7 ? sampleTexts[Math.floor(Math.random() * sampleTexts.length)] : undefined,
                updated_at: new Date().toISOString(),
            });
        }
    }
  });
  return logs;
};

export const LOGS = generateLogs();

// Recalculate streaks based on generated logs (Mocking the backend logic)
HABITS.forEach(habit => {
    const habitLogs = LOGS.filter(l => l.habit_id === habit.id && l.value).map(l => l.date).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentCheck = today;
    // Check if done today or yesterday to start streak
    if (!habitLogs.includes(today)) {
        if (habitLogs.includes(yesterday)) {
            currentCheck = yesterday;
        } else {
             // Streak broken
            habit.streak = 0;
            return;
        }
    }

    // Simple consecutive day check
    let checkDate = new Date(currentCheck);
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (habitLogs.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    habit.streak = streak;
});

// Mock data for Dashboard Radar Chart matching current UI
export const RADAR_DATA = {
  labels: CATEGORIES.map(c => c.name),
  data: [80, 65, 70, 90, 60, 75], 
};


