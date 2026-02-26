const getMockProfiles = (answers) => {
  const yesCount = answers.filter((a) => a.answer === "yes").length;
  const noCount = answers.filter((a) => a.answer === "no").length;

  const ratio = yesCount / (yesCount + noCount);

  let archetype = "";
  let description = "";

  if (ratio > 0.7) {
    archetype = "🌟 The Enthusiastic Adventurer";
    description = `You're someone who embraces life with open arms! Your tendency to say "yes" to questions shows you're optimistic, open-minded, and ready for new experiences. You probably have a packed calendar and are always the friend who's up for trying that new restaurant or spontaneous road trip.

Your vibe: 🎉 Energetic • 🌈 Optimistic • 🚀 Spontaneous

**Prediction:** This year, your adventurous spirit will lead you to an unexpected opportunity. Keep saying yes (but maybe also learn when to say no to sleep deprivation)!`;
  } else if (ratio < 0.3) {
    archetype = "🎯 The Thoughtful Realist";
    description = `You're selective about what you commit to, and that's actually a superpower! Your careful approach means you value quality over quantity. You're probably the friend who gives the best advice and always has a well-thought-out plan B (and C, and D).

Your vibe: 🧠 Analytical • 🎨 Intentional • 🌙 Thoughtful

**Prediction:** Your discerning nature will help you avoid a major mishap this year that everyone else falls for. Trust your gut – it's usually right!`;
  } else {
    archetype = "⚖️ The Balanced Harmonizer";
    description = `You've mastered the art of balance! Your mix of yes and no answers shows you're neither overly cautious nor recklessly spontaneous. You probably consider things carefully but aren't afraid to take calculated risks. You're the friend everyone comes to for balanced advice.

Your vibe: 🌸 Balanced • 💫 Adaptable • 🎭 Versatile

**Prediction:** Your ability to see both sides will make you the unexpected mediator in a group situation. Your friends secretly think you should run for office.`;
  }
  return `## ${archetype}\n\n${description}`;
};

export default getMockProfiles;
