import { z } from "zod";
import {
  insertCourseSchema,
  insertDepartmentSchema,
  insertEnrollmentSchema,
  insertLecturerSchema,
  insertMaterialSchema,
  insertNotificationSchema,
  insertStudentSchema,
  insertUnitSchema,
} from "./schema";
import type {
  Course,
  Department,
  Enrollment,
  Lecturer,
  Material,
  Notification,
  Student,
  Unit,
  UserRole,
} from "./schema";
import type { User } from "./models/auth";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const zUser = z.custom<User>();
export const zRole = z.custom<UserRole>();

export const api = {
  me: {
    get: {
      method: "GET" as const,
      path: "/api/me",
      responses: {
        200: z.object({
          user: zUser.nullable(),
          role: zRole.nullable(),
        }),
      },
    },
  },
  admin: {
    departments: {
      list: {
        method: "GET" as const,
        path: "/api/admin/departments",
        responses: {
          200: z.array(z.custom<Department>()),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/departments",
        input: insertDepartmentSchema,
        responses: {
          201: z.custom<Department>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/admin/departments/:id",
        input: insertDepartmentSchema.partial(),
        responses: {
          200: z.custom<Department>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/departments/:id",
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
    courses: {
      list: {
        method: "GET" as const,
        path: "/api/admin/courses",
        responses: {
          200: z.array(z.custom<Course>()),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/courses",
        input: insertCourseSchema,
        responses: {
          201: z.custom<Course>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/admin/courses/:id",
        input: insertCourseSchema.partial(),
        responses: {
          200: z.custom<Course>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/courses/:id",
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
    lecturers: {
      list: {
        method: "GET" as const,
        path: "/api/admin/lecturers",
        responses: {
          200: z.array(z.custom<Lecturer>()),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/lecturers",
        input: insertLecturerSchema,
        responses: {
          201: z.custom<Lecturer>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/admin/lecturers/:id",
        input: insertLecturerSchema.partial(),
        responses: {
          200: z.custom<Lecturer>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/lecturers/:id",
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
    students: {
      list: {
        method: "GET" as const,
        path: "/api/admin/students",
        responses: {
          200: z.array(z.custom<Student>()),
        },
      },
    },
  },
  lecturer: {
    myCourses: {
      list: {
        method: "GET" as const,
        path: "/api/lecturer/courses",
        responses: {
          200: z.array(
            z.object({
              course: z.custom<Course>(),
              department: z.custom<Department>(),
            })
          ),
        },
      },
    },
    units: {
      list: {
        method: "GET" as const,
        path: "/api/lecturer/units",
        input: z
          .object({
            courseId: z.coerce.number().optional(),
          })
          .optional(),
        responses: {
          200: z.array(
            z.object({
              unit: z.custom<Unit>(),
              course: z.custom<Course>(),
              department: z.custom<Department>(),
              enrolledCount: z.number(),
            })
          ),
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/lecturer/units",
        input: insertUnitSchema,
        responses: {
          201: z.custom<Unit>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/lecturer/units/:id",
        input: insertUnitSchema.partial(),
        responses: {
          200: z.custom<Unit>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/lecturer/units/:id",
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
    enrollments: {
      create: {
        method: "POST" as const,
        path: "/api/lecturer/units/:unitId/enrollments",
        input: z.object({
          admissionNumber: z
            .string()
            .regex(/^[A-Z]{2,6}\/\d{3,5}\/\d{2}[A-Z]$/, {
              message: "Admission number format must look like SCM/6155/25S",
            }),
          fullName: z.string().min(2),
        }),
        responses: {
          201: z.custom<Enrollment>(),
          200: z.object({
            requiresConfirmation: z.literal(true),
            existingUnits: z.array(
              z.object({
                unit: z.custom<Unit>(),
                course: z.custom<Course>(),
                department: z.custom<Department>(),
              })
            ),
            student: z.custom<Student>(),
          }),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      confirmAdd: {
        method: "POST" as const,
        path: "/api/lecturer/units/:unitId/enrollments/confirm",
        input: z.object({
          admissionNumber: z
            .string()
            .regex(/^[A-Z]{2,6}\/\d{3,5}\/\d{2}[A-Z]$/),
        }),
        responses: {
          201: z.custom<Enrollment>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      list: {
        method: "GET" as const,
        path: "/api/lecturer/units/:unitId/enrollments",
        responses: {
          200: z.array(
            z.object({
              enrollment: z.custom<Enrollment>(),
              student: z.custom<Student>(),
            })
          ),
          404: errorSchemas.notFound,
        },
      },
    },
    materials: {
      list: {
        method: "GET" as const,
        path: "/api/lecturer/units/:unitId/materials",
        responses: {
          200: z.array(z.custom<Material>()),
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/lecturer/units/:unitId/materials",
        input: insertMaterialSchema.extend({
          type: z.enum([
            "pdf",
            "video",
            "scanned_notes",
            "assignment",
            "qa_task",
          ]),
          deadlineAt: z.coerce.date().optional().nullable(),
        }),
        responses: {
          201: z.custom<Material>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/lecturer/materials/:id",
        input: insertMaterialSchema
          .partial()
          .extend({ deadlineAt: z.coerce.date().optional().nullable() }),
        responses: {
          200: z.custom<Material>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/lecturer/materials/:id",
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
  },
  student: {
    dashboard: {
      get: {
        method: "GET" as const,
        path: "/api/student/dashboard",
        responses: {
          200: z.object({
            student: z.custom<Student>(),
            units: z.array(
              z.object({
                unit: z.custom<Unit>(),
                course: z.custom<Course>(),
                department: z.custom<Department>(),
                lecturer: z.custom<Lecturer>(),
              })
            ),
            unreadNotifications: z.number(),
          }),
        },
      },
    },
    materials: {
      listForUnit: {
        method: "GET" as const,
        path: "/api/student/units/:unitId/materials",
        responses: {
          200: z.array(
            z.object({
              material: z.custom<Material>(),
              isLocked: z.boolean(),
              lockReason: z.string().optional(),
              timeToDeadlineSeconds: z.number().optional(),
            })
          ),
          404: errorSchemas.notFound,
        },
      },
    },
    notifications: {
      list: {
        method: "GET" as const,
        path: "/api/student/notifications",
        input: z
          .object({
            unreadOnly: z.coerce.boolean().optional(),
          })
          .optional(),
        responses: {
          200: z.array(z.custom<Notification>()),
        },
      },
      markRead: {
        method: "POST" as const,
        path: "/api/student/notifications/:id/read",
        responses: {
          200: z.custom<Notification>(),
          404: errorSchemas.notFound,
        },
      },
    },
    password: {
      change: {
        method: "POST" as const,
        path: "/api/student/password/change",
        input: z.object({
          newPassword: z.string().min(8),
        }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
        },
      },
    },
  },
} as const;

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MeResponse = z.infer<typeof api.me.get.responses[200]>;

export type DepartmentInput = z.infer<typeof api.admin.departments.create.input>;
export type DepartmentResponse = z.infer<
  typeof api.admin.departments.create.responses[201]
>;

export type CourseInput = z.infer<typeof api.admin.courses.create.input>;
export type CourseResponse = z.infer<typeof api.admin.courses.create.responses[201]>;

export type LecturerInput = z.infer<typeof api.admin.lecturers.create.input>;
export type LecturerResponse = z.infer<
  typeof api.admin.lecturers.create.responses[201]
>;

export type UnitInput = z.infer<typeof api.lecturer.units.create.input>;
export type UnitResponse = z.infer<typeof api.lecturer.units.create.responses[201]>;

export type EnrollmentCreateInput = z.infer<
  typeof api.lecturer.enrollments.create.input
>;

export type MaterialInput = z.infer<typeof api.lecturer.materials.create.input>;
export type MaterialResponse = z.infer<typeof api.lecturer.materials.create.responses[201]>;

export type StudentDashboardResponse = z.infer<
  typeof api.student.dashboard.get.responses[200]
>;

export type StudentMaterialsResponse = z.infer<
  typeof api.student.materials.listForUnit.responses[200]
>;

export type StudentNotificationsResponse = z.infer<
  typeof api.student.notifications.list.responses[200]
>;
