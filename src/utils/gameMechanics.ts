export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 0) return 1;
  return Math.floor(totalXp / 1000) + 1;
};

export const calculateNextLevelProgress = (totalXp: number) => {
  const xpPerLevel = 1000;
  const currentLevel = calculateLevel(totalXp);
  const xpForCurrentLevel = (currentLevel - 1) * xpPerLevel;
  const currentLevelXp = totalXp - xpForCurrentLevel;
  
  return {
    level: currentLevel,
    current_xp: currentLevelXp,
    needed_for_next: xpPerLevel,
    percentage: Math.min(Math.round((currentLevelXp / xpPerLevel) * 100), 100)
  };
};