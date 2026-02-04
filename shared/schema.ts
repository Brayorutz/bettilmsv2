import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const USER_ROLES = {
  admin: "admin",
  lecturer: "lecturer",
  student: "student",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  courses: many(courses),
  lecturers: many(lecturers),
}));

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  code: varchar("code", { length: 40 }).notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  department: one(departments, {
    fields: [courses.departmentId],
    references: [departments.id],
  }),
  lecturerAssignments: many(lecturerCourseAssignments),
  units: many(units),
}));

export const lecturers = pgTable(
  "lecturers",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().unique(),
    staffNumber: varchar("staff_number", { length: 50 }).notNull(),
    fullName: text("full_name").notNull(),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [uniqueIndex("lecturers_staff_number_uq").on(t.staffNumber)]
);

export const lecturersRelations = relations(lecturers, ({ one, many }) => ({
  department: one(departments, {
    fields: [lecturers.departmentId],
    references: [departments.id],
  }),
  courseAssignments: many(lecturerCourseAssignments),
  units: many(units),
  notificationsSent: many(notifications),
}));

export const lecturerCourseAssignments = pgTable(
  "lecturer_course_assignments",
  {
    id: serial("id").primaryKey(),
    lecturerId: integer("lecturer_id")
      .notNull()
      .references(() => lecturers.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("lect_course_uq").on(t.lecturerId, t.courseId)]
);

export const lecturerCourseAssignmentsRelations = relations(
  lecturerCourseAssignments,
  ({ one }) => ({
    lecturer: one(lecturers, {
      fields: [lecturerCourseAssignments.lecturerId],
      references: [lecturers.id],
    }),
    course: one(courses, {
      fields: [lecturerCourseAssignments.courseId],
      references: [courses.id],
    }),
  })
);

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().unique(),
    admissionNumber: varchar("admission_number", { length: 50 }).notNull(),
    fullName: text("full_name").notNull(),
    mustChangePassword: boolean("must_change_password").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [uniqueIndex("students_admission_uq").on(t.admissionNumber)]
);

export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
  notifications: many(notifications),
}));

export const units = pgTable(
  "units",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    lecturerId: integer("lecturer_id")
      .notNull()
      .references(() => lecturers.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [uniqueIndex("units_course_code_uq").on(t.courseId, t.code)]
);

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lecturer: one(lecturers, {
    fields: [units.lecturerId],
    references: [lecturers.id],
  }),
  enrollments: many(enrollments),
  materials: many(materials),
  notifications: many(notifications),
}));

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("enrollment_unit_student_uq").on(t.unitId, t.studentId)]
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  unit: one(units, {
    fields: [enrollments.unitId],
    references: [units.id],
  }),
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
}));

export const MATERIAL_TYPES = {
  pdf: "pdf",
  video: "video",
  scannedNotes: "scanned_notes",
  assignment: "assignment",
  qaTask: "qa_task",
} as const;

export type MaterialType = (typeof MATERIAL_TYPES)[keyof typeof MATERIAL_TYPES];

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  instruction: text("instruction"),
  url: text("url"),
  deadlineAt: timestamp("deadline_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materialsRelations = relations(materials, ({ one }) => ({
  unit: one(units, {
    fields: [materials.unitId],
    references: [units.id],
  }),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "set null" }),
  materialId: integer("material_id").references(() => materials.id, {
    onDelete: "set null",
  }),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 20 }).notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  student: one(students, {
    fields: [notifications.studentId],
    references: [students.id],
  }),
  unit: one(units, {
    fields: [notifications.unitId],
    references: [units.id],
  }),
  material: one(materials, {
    fields: [notifications.materialId],
    references: [materials.id],
  }),
}));

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertLecturerSchema = createInsertSchema(lecturers).omit({
  id: true,
});
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
});
export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lecturer = typeof lecturers.$inferSelect;
export type InsertLecturer = z.infer<typeof insertLecturerSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type CreateDepartmentRequest = InsertDepartment;
export type UpdateDepartmentRequest = Partial<InsertDepartment>;
export type DepartmentResponse = Department;

export type CreateCourseRequest = InsertCourse;
export type UpdateCourseRequest = Partial<InsertCourse>;
export type CourseResponse = Course;

export type CreateLecturerRequest = InsertLecturer;
export type UpdateLecturerRequest = Partial<InsertLecturer>;
export type LecturerResponse = Lecturer;

export type CreateStudentRequest = InsertStudent;
export type UpdateStudentRequest = Partial<InsertStudent>;
export type StudentResponse = Student;

export type CreateUnitRequest = InsertUnit;
export type UpdateUnitRequest = Partial<InsertUnit>;
export type UnitResponse = Unit;

export type CreateEnrollmentRequest = InsertEnrollment;
export type EnrollmentResponse = Enrollment;

export type CreateMaterialRequest = InsertMaterial;
export type UpdateMaterialRequest = Partial<InsertMaterial>;
export type MaterialResponse = Material;

export type CreateNotificationRequest = InsertNotification;
export type UpdateNotificationRequest = Partial<InsertNotification>;
export type NotificationResponse = Notification;

export interface StudentsSearchQuery {
  q?: string;
  unitId?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}
