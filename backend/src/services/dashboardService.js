// backend/src/services/dashboardService.js
const prisma = require('../lib/prisma');
const { getStreak } = require('./streakService');

/**
 * Compiles aggregated dashboard metrics for the authenticated user
 */
async function getDashboardData(userId, queryCourseId = null) {
  // 1. User info & Streak
  const [user, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    getStreak(userId),
  ]);

  // 2. Enrollments with progress percentages
  let userEnrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  // Auto-enroll user in available courses if first time viewing dashboard
  if (userEnrollments.length === 0) {
    const allCourses = await prisma.course.findMany({ select: { id: true } });
    if (allCourses.length > 0) {
      const { enrollInCourse } = require('./courseService');
      for (const c of allCourses) {
        await enrollInCourse(c.id, userId).catch(() => null);
      }
      userEnrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });
    }
  }

  const courseIds = userEnrollments.map((e) => e.courseId);

  // Fetch completed lessons count grouped by lesson.courseId
  const completedLessons = await prisma.userLesson.findMany({
    where: {
      userId,
      status: 'completed',
      lesson: {
        courseId: { in: courseIds },
      },
    },
    select: {
      lessonId: true,
      completedAt: true,
      lesson: { select: { courseId: true } },
    },
  });

  const completedCountByCourse = {};
  for (const ul of completedLessons) {
    const cId = ul.lesson.courseId;
    completedCountByCourse[cId] = (completedCountByCourse[cId] || 0) + 1;
  }

  const enrollments = userEnrollments.map((e) => {
    const totalLessons = e.course.lessons.length;
    const completed = completedCountByCourse[e.courseId] || 0;
    const percent = totalLessons > 0 ? Number((completed / totalLessons).toFixed(2)) : 0;
    return {
      courseId: e.courseId,
      title: e.course.title,
      language: e.course.language,
      percent,
    };
  });

  // 3. Active Course resolution
  let activeEnrollment = null;
  if (queryCourseId) {
    activeEnrollment = userEnrollments.find((e) => e.courseId === queryCourseId) || null;
  }
  if (!activeEnrollment && userEnrollments.length > 0) {
    activeEnrollment = userEnrollments[0];
  }

  let activeCourse = null;
  let nextUp = [];

  if (activeEnrollment) {
    const activeCourseId = activeEnrollment.courseId;

    const [conceptsTotal, userConceptsDone, activeCourseCompletedCount, activeCourseTotalLessons] =
      await Promise.all([
        prisma.concept.count({
          where: { courseId: activeCourseId },
        }),
        prisma.userConcept.count({
          where: {
            userId,
            mastery: { gte: 0.7 },
            concept: { courseId: activeCourseId },
          },
        }),
        prisma.userLesson.count({
          where: {
            userId,
            status: 'completed',
            lesson: { courseId: activeCourseId },
          },
        }),
        prisma.lesson.count({
          where: { courseId: activeCourseId },
        }),
      ]);

    const activePercent =
      activeCourseTotalLessons > 0
        ? Number((activeCourseCompletedCount / activeCourseTotalLessons).toFixed(2))
        : 0;

    activeCourse = {
      courseId: activeCourseId,
      title: activeEnrollment.course.title,
      language: activeEnrollment.course.language,
      diagnosticScore: activeEnrollment.diagnosticScore
        ? Number(activeEnrollment.diagnosticScore)
        : null,
      conceptsDone: userConceptsDone,
      conceptsTotal,
      percent: activePercent,
      currentFocus: activeEnrollment.currentFocus || null,
    };

    // Up to 3 next-up lessons (in-progress or queued), ordered by position
    const upcomingUserLessons = await prisma.userLesson.findMany({
      where: {
        userId,
        status: { in: ['in_progress', 'queued'] },
        lesson: { courseId: activeCourseId },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            kind: true,
            estMinutes: true,
            position: true,
          },
        },
      },
      orderBy: {
        lesson: { position: 'asc' },
      },
      take: 3,
    });

    nextUp = upcomingUserLessons.map((ul) => ({
      lessonId: ul.lesson.id,
      title: ul.lesson.title,
      kind: ul.lesson.kind,
      estMinutes: ul.lesson.estMinutes,
      status: ul.status,
    }));

    // If no upcoming user lessons were queued, retrieve the active course's real lessons from the database
    if (nextUp.length === 0) {
      const defaultLessons = await prisma.lesson.findMany({
        where: { courseId: activeCourseId },
        orderBy: { position: 'asc' },
        take: 3,
      });
      nextUp = defaultLessons.map((l, idx) => ({
        lessonId: l.id,
        title: l.title,
        kind: l.kind,
        estMinutes: l.estMinutes,
        status: idx === 0 ? 'next' : 'queued',
      }));
    }
  }

  // 4. Self-Reliance: Autonomy percentage & change this week
  // Autonomy % = % of completed lessons with NO HintEvent level 4
  const allCompletedUserLessons = await prisma.userLesson.findMany({
    where: {
      userId,
      status: 'completed',
    },
    select: {
      lessonId: true,
      completedAt: true,
    },
  });

  const level4HintEvents = await prisma.hintEvent.findMany({
    where: {
      userId,
      level: 4,
    },
    select: { lessonId: true },
  });

  const level4LessonIds = new Set(level4HintEvents.map((h) => h.lessonId).filter(Boolean));

  let autonomyPct = 100;
  let changeThisWeek = 0;

  if (allCompletedUserLessons.length > 0) {
    const autonomousCount = allCompletedUserLessons.filter(
      (ul) => !level4LessonIds.has(ul.lessonId)
    ).length;
    autonomyPct = Math.round((autonomousCount / allCompletedUserLessons.length) * 100);

    // Week over week comparison
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekLessons = allCompletedUserLessons.filter(
      (ul) => ul.completedAt && ul.completedAt >= sevenDaysAgo
    );
    const lastWeekLessons = allCompletedUserLessons.filter(
      (ul) => ul.completedAt && ul.completedAt >= fourteenDaysAgo && ul.completedAt < sevenDaysAgo
    );

    if (thisWeekLessons.length > 0 && lastWeekLessons.length > 0) {
      const thisWeekAutonomous = thisWeekLessons.filter(
        (ul) => !level4LessonIds.has(ul.lessonId)
      ).length;
      const lastWeekAutonomous = lastWeekLessons.filter(
        (ul) => !level4LessonIds.has(ul.lessonId)
      ).length;

      const thisWeekPct = Math.round((thisWeekAutonomous / thisWeekLessons.length) * 100);
      const lastWeekPct = Math.round((lastWeekAutonomous / lastWeekLessons.length) * 100);

      changeThisWeek = thisWeekPct - lastWeekPct;
    }
  }

  // 5. Bug DNA: Top 5 Mistake groups by BugPattern
  const mistakeGroups = await prisma.mistake.groupBy({
    by: ['patternId'],
    where: { userId },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 5,
  });

  const patternIds = mistakeGroups.map((g) => g.patternId);
  const patterns = await prisma.bugPattern.findMany({
    where: { id: { in: patternIds } },
  });

  const patternMap = new Map(patterns.map((p) => [p.id, p]));

  const bugDna = mistakeGroups
    .map((g) => {
      const p = patternMap.get(g.patternId);
      if (!p) return null;
      return {
        name: p.name,
        category: p.category,
        severity: p.defaultSeverity,
        timesDetected: g._count.id,
      };
    })
    .filter(Boolean);

  return {
    user: { name: user?.name || 'Learner' },
    streak,
    enrollments,
    activeCourse,
    nextUp,
    selfReliance: {
      autonomyPct,
      changeThisWeek,
    },
    bugDna,
  };
}

module.exports = {
  getDashboardData,
};
