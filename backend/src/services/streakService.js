// backend/src/services/streakService.js
const prisma = require('../lib/prisma');

/**
 * Normalizes a Date object to YYYY-MM-DD
 */
function toDateString(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

/**
 * Upserts today's date into ActivityDay for the user (ignores duplicate errors)
 */
async function recordActivity(userId) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.activityDay.upsert({
      where: {
        userId_day: {
          userId,
          day: today,
        },
      },
      update: {},
      create: {
        userId,
        day: today,
      },
    });
  } catch (err) {
    // Fail silently on concurrent writes / duplicate keys
    console.warn('[StreakService] Failed to record activity day:', err.message);
  }
}

/**
 * Calculates current consecutive active streak ending today or yesterday
 */
async function getStreak(userId) {
  const activities = await prisma.activityDay.findMany({
    where: { userId },
    orderBy: { day: 'desc' },
  });

  if (!activities || activities.length === 0) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(activities.map((a) => toDateString(a.day)))
  ).sort().reverse();

  const now = new Date();
  const todayStr = toDateString(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = toDateString(yesterdayDate);

  const mostRecentDay = uniqueDays[0];
  if (mostRecentDay !== todayStr && mostRecentDay !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(mostRecentDay);

  for (const dayStr of uniqueDays) {
    const currentExpectedStr = toDateString(expectedDate);
    if (dayStr === currentExpectedStr) {
      streak++;
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = {
  recordActivity,
  getStreak,
};
