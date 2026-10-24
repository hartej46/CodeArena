// backend/src/services/courseService.js
const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');

/**
 * List all courses with user's enrollment status
 */
async function listCourses(userId) {
  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    include: {
      enrollments: {
        where: { userId },
        select: {
          enrolledAt: true,
          diagnosticScore: true,
          currentFocus: true,
        },
      },
      _count: {
        select: {
          lessons: true,
          concepts: true,
        },
      },
    },
  });

  return courses.map((course) => {
    const enrollment = course.enrollments[0] || null;
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      language: course.language,
      isEnrolled: Boolean(enrollment),
      enrolledAt: enrollment?.enrolledAt || null,
      diagnosticScore: enrollment?.diagnosticScore ? Number(enrollment.diagnosticScore) : null,
      currentFocus: enrollment?.currentFocus || null,
      totalLessons: course._count.lessons,
      totalConcepts: course._count.concepts,
    };
  });
}

/**
 * Get detailed course view with concepts and lessons including user's lesson status
 */
async function getCourseDetails(courseId, userId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        where: { userId },
        select: {
          diagnosticScore: true,
          currentFocus: true,
          enrolledAt: true,
        },
      },
      concepts: {
        orderBy: { position: 'asc' },
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            include: {
              userLessons: {
                where: { userId },
                select: {
                  status: true,
                  bestConfidence: true,
                  completedAt: true,
                },
              },
            },
          },
        },
      },
      lessons: {
        where: { conceptId: null },
        orderBy: { position: 'asc' },
        include: {
          userLessons: {
            where: { userId },
            select: {
              status: true,
              bestConfidence: true,
              completedAt: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new AppError('Course not found.', 404);
  }

  const enrollment = course.enrollments[0] || null;

  const formatLesson = (lesson) => {
    const userLesson = lesson.userLessons[0] || null;
    return {
      id: lesson.id,
      title: lesson.title,
      kind: lesson.kind,
      estMinutes: lesson.estMinutes,
      task: lesson.task,
      position: lesson.position,
      status: userLesson ? userLesson.status : 'not_started',
      bestConfidence: userLesson?.bestConfidence ? Number(userLesson.bestConfidence) : null,
      completedAt: userLesson?.completedAt || null,
    };
  };

  const formattedConcepts = course.concepts.map((concept) => ({
    id: concept.id,
    name: concept.name,
    position: concept.position,
    lessons: concept.lessons.map(formatLesson),
  }));

  const standaloneLessons = course.lessons.map(formatLesson);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    language: course.language,
    isEnrolled: Boolean(enrollment),
    diagnosticScore: enrollment?.diagnosticScore ? Number(enrollment.diagnosticScore) : null,
    currentFocus: enrollment?.currentFocus || null,
    concepts: formattedConcepts,
    standaloneLessons,
  };
}

/**
 * Enroll user in a course and initialize queued UserLesson entries
 */
async function enrollInCourse(courseId, userId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { select: { id: true } },
    },
  });

  if (!course) {
    throw new AppError('Course not found.', 404);
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId,
      courseId,
    },
  });

  // Initialize queued UserLesson rows for all course lessons
  if (course.lessons.length > 0) {
    await prisma.$transaction(
      course.lessons.map((lesson) =>
        prisma.userLesson.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId: lesson.id,
            },
          },
          update: {},
          create: {
            userId,
            lessonId: lesson.id,
            status: 'queued',
          },
        })
      )
    );
  }

  return {
    courseId: enrollment.courseId,
    userId: enrollment.userId,
    enrolledAt: enrollment.enrolledAt,
    lessonsEnrolled: course.lessons.length,
  };
}

module.exports = {
  listCourses,
  getCourseDetails,
  enrollInCourse,
};
