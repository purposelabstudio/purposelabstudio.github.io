// Curated journaling prompts. pickPrompt is deterministic for testing;
// the page passes a random index at runtime.
export const PROMPTS = [
  'What is one thing that went well today, and why?',
  'What are you grateful for right now?',
  'Describe how you feel in three words, then explain the first one.',
  'What is taking up the most space in your mind today?',
  'What would make tomorrow feel like a good day?',
  'What is a small win you had this week?',
  'What is something you are looking forward to?',
  'Who made a positive difference in your day, and how?',
  'What drained your energy today, and what restored it?',
  'What is one thing you would do differently if you could redo today?',
  'What is a worry you can let go of tonight?',
  'What did you learn about yourself this week?',
  'Describe a moment today when you felt calm.',
  'What is one boundary you want to protect this week?',
  'What is a habit you want to build, and the next tiny step for it?',
  'What made you smile recently?',
  'What is something kind you can do for yourself tomorrow?',
  'What is a challenge you are facing, and one option you have not tried?',
  'What are you proud of right now?',
  'What would you tell a friend who had the day you just had?',
  'What is one thing you want to remember about today?',
  'How did you take care of your body today?',
];

export function pickPrompt(index) {
  return PROMPTS[((index % PROMPTS.length) + PROMPTS.length) % PROMPTS.length];
}
