import { db } from "./db";
import {
  courses,
  departments,
  enrollments,
  lecturerCourseAssignments,
  lecturers,
  materials,
  notifications,
  students,
  units,
  users,
  type Course,
  type CreateCourseRequest,
  type CreateDepartmentRequest,
  type CreateLecturerRequest,
  type CreateMaterialRequest,
  type Department,
  type Lecturer,
  type Material,
  type Notification,
  type Student,
  type Unit,
  type UpdateCourseRequest,
  type UpdateDepartmentRequest,
  type UpdateLecturerRequest,
  type UpdateMaterialRequest,
  type UpdateUnitRequest,
  type UpdateStudentRequest,
  type CreateStudentRequest,
} from "@shared/schema";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  listDepartments(): Promise<Department[]>;
  createDepartment(input: CreateDepartmentRequest): Promise<Department>;
  updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;

  listCourses(): Promise<Course[]>;
  createCourse(input: CreateCourseRequest): Promise<Course>;
  updateCourse(id: number, updates: UpdateCourseRequest): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  listLecturers(): Promise<Lecturer[]>;
  createLecturer(input: CreateLecturerRequest): Promise<Lecturer>;
  updateLecturer(id: number, updates: UpdateLecturerRequest): Promise<Lecturer | undefined>;
  deleteLecturer(id: number): Promise<boolean>;

  listStudents(query?: { q?: string }): Promise<Student[]>;
  createStudent(input: CreateStudentRequest): Promise<Student>;
  updateStudent(id: number, updates: UpdateStudentRequest): Promise<Student | undefined>;
  getStudentByAdmissionNumber(admissionNumber: string): Promise<Student | undefined>;

  setLecturerCourseAssignments(lecturerId: number, courseIds: number[]): Promise<void>;
  listLecturerCourses(lecturerUserId: string): Promise<{ course: Course; department: Department }[]>;

  listLecturerUnits(
    lecturerUserId: string,
    query?: { courseId?: number }
  ): Promise<{ unit: Unit; course: Course; department: Department; enrolledCount: number }[]>;
  createUnit(input: { lecturerUserId: string } & Omit<UpdateUnitRequest, "lecturerId">): Promise<Unit>;
  updateUnit(lecturerUserId: string, id: number, updates: UpdateUnitRequest): Promise<Unit | undefined>;
  deleteUnit(lecturerUserId: string, id: number): Promise<boolean>;

  listUnitEnrollments(lecturerUserId: string, unitId: number): Promise<{ enrollment: any; student: Student }[]>;
  enrollStudentToUnit(
    lecturerUserId: string,
    unitId: number,
    input: { admissionNumber: string; fullName: string },
    mode: "normal" | "confirm"
  ): Promise<
    | { kind: "enrolled"; enrollment: any }
    | {
        kind: "needs_confirmation";
        student: Student;
        existingUnits: { unit: Unit; course: Course; department: Department }[];
      }
  >;

  listLecturerMaterials(lecturerUserId: string, unitId: number): Promise<Material[]>;
  createMaterial(lecturerUserId: string, unitId: number, input: CreateMaterialRequest): Promise<Material>;
  updateMaterial(lecturerUserId: string, id: number, updates: UpdateMaterialRequest): Promise<Material | undefined>;
  deleteMaterial(lecturerUserId: string, id: number): Promise<boolean>;

  getStudentDashboard(
    studentUserId: string
  ): Promise<
    | {
        student: Student;
        units: { unit: Unit; course: Course; department: Department; lecturer: Lecturer }[];
        unreadNotifications: number;
      }
    | undefined
  >;

  listStudentNotifications(studentUserId: string, query?: { unreadOnly?: boolean }): Promise<Notification[]>;
  markNotificationRead(studentUserId: string, notificationId: number): Promise<Notification | undefined>;

  listStudentUnitMaterials(
    studentUserId: string,
    unitId: number
  ): Promise<{ material: Material; isLocked: boolean; lockReason?: string; timeToDeadlineSeconds?: number }[]>;

  getLecturerByUserId(userId: string): Promise<Lecturer | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  seed(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async listDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async createDepartment(input: CreateDepartmentRequest): Promise<Department> {
    const [row] = await db.insert(departments).values(input).returning();
    return row;
  }

  async updateDepartment(id: number, updates: UpdateDepartmentRequest): Promise<Department | undefined> {
    const [row] = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
    return row;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const rows = await db.delete(departments).where(eq(departments.id, id)).returning();
    return rows.length > 0;
  }

  async listCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(courses.name);
  }

  async createCourse(input: CreateCourseRequest): Promise<Course> {
    const [row] = await db.insert(courses).values(input).returning();
    return row;
  }

  async updateCourse(id: number, updates: UpdateCourseRequest): Promise<Course | undefined> {
    const [row] = await db.update(courses).set(updates).where(eq(courses.id, id)).returning();
    return row;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const rows = await db.delete(courses).where(eq(courses.id, id)).returning();
    return rows.length > 0;
  }

  async listLecturers(): Promise<Lecturer[]> {
    return await db.select().from(lecturers).orderBy(desc(lecturers.id));
  }

  async createLecturer(input: CreateLecturerRequest): Promise<Lecturer> {
    // Automatically create a user account for the lecturer
    const [user] = await db
      .insert(users)
      .values({
        username: input.staffNumber,
        password: "password123", // Default password
        role: "lecturer",
        firstName: input.fullName.split(" ")[0],
        lastName: input.fullName.split(" ").slice(1).join(" ") || "",
      })
      .returning();

    const [row] = await db.insert(lecturers).values({
      ...input,
      userId: user.id,
    }).returning();
    return row;
  }

  async updateLecturer(id: number, updates: UpdateLecturerRequest): Promise<Lecturer | undefined> {
    const [row] = await db.update(lecturers).set(updates).where(eq(lecturers.id, id)).returning();
    return row;
  }

  async deleteLecturer(id: number): Promise<boolean> {
    const rows = await db.delete(lecturers).where(eq(lecturers.id, id)).returning();
    return rows.length > 0;
  }

  async listStudents(query?: { q?: string }): Promise<Student[]> {
    if (!query?.q) {
      return await db.select().from(students).orderBy(desc(students.id));
    }

    const q = query.q.trim();
    if (!q) {
      return await db.select().from(students).orderBy(desc(students.id));
    }

    return await db
      .select()
      .from(students)
      .where(or(ilike(students.fullName, `%${q}%`), ilike(students.admissionNumber, `%${q}%`)))
      .orderBy(desc(students.id));
  }

  async createStudent(input: CreateStudentRequest): Promise<Student> {
    const [row] = await db.insert(students).values(input).returning();
    return row;
  }

  async updateStudent(id: number, updates: UpdateStudentRequest): Promise<Student | undefined> {
    const [row] = await db.update(students).set(updates).where(eq(students.id, id)).returning();
    return row;
  }

  async getStudentByAdmissionNumber(admissionNumber: string): Promise<Student | undefined> {
    const [row] = await db.select().from(students).where(eq(students.admissionNumber, admissionNumber));
    return row;
  }

  async setLecturerCourseAssignments(lecturerId: number, courseIds: number[]): Promise<void> {
    await db
      .delete(lecturerCourseAssignments)
      .where(eq(lecturerCourseAssignments.lecturerId, lecturerId));

    if (courseIds.length === 0) return;

    await db.insert(lecturerCourseAssignments).values(
      courseIds.map((courseId) => ({
        lecturerId,
        courseId,
      }))
    );
  }

  async listLecturerCourses(lecturerUserId: string): Promise<{ course: Course; department: Department }[]> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return [];

    const rows = await db
      .select({
        course: courses,
        department: departments,
      })
      .from(lecturerCourseAssignments)
      .innerJoin(courses, eq(courses.id, lecturerCourseAssignments.courseId))
      .innerJoin(departments, eq(departments.id, courses.departmentId))
      .where(eq(lecturerCourseAssignments.lecturerId, lecturer.id))
      .orderBy(courses.name);

    return rows;
  }

  async listLecturerUnits(
    lecturerUserId: string,
    query?: { courseId?: number }
  ): Promise<{ unit: Unit; course: Course; department: Department; enrolledCount: number }[]> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return [];

    const whereParts = [eq(units.lecturerId, lecturer.id)];
    if (query?.courseId) whereParts.push(eq(units.courseId, query.courseId));

    const rows = await db
      .select({
        unit: units,
        course: courses,
        department: departments,
        enrolledCount: count(enrollments.id).mapWith(Number).as("enrolledCount"),
      })
      .from(units)
      .innerJoin(courses, eq(courses.id, units.courseId))
      .innerJoin(departments, eq(departments.id, courses.departmentId))
      .leftJoin(enrollments, eq(enrollments.unitId, units.id))
      .where(and(...whereParts))
      .groupBy(units.id, courses.id, departments.id)
      .orderBy(desc(units.id));

    return rows;
  }

  async createUnit(
    input: { lecturerUserId: string } & Omit<UpdateUnitRequest, "lecturerId">
  ): Promise<Unit> {
    const lecturer = await this.getLecturerByUserId(input.lecturerUserId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    const { lecturerUserId, ...rest } = input;
    const [row] = await db
      .insert(units)
      .values({
        courseId: rest.courseId,
        title: rest.title,
        code: rest.code,
        description: rest.description,
        isActive: rest.isActive ?? true,
        lecturerId: lecturer.id,
      })
      .returning();
    return row;
  }

  async updateUnit(
    lecturerUserId: string,
    id: number,
    updates: UpdateUnitRequest
  ): Promise<Unit | undefined> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return undefined;

    const [row] = await db
      .update(units)
      .set({ ...updates, lecturerId: lecturer.id })
      .where(and(eq(units.id, id), eq(units.lecturerId, lecturer.id)))
      .returning();
    return row;
  }

  async deleteUnit(lecturerUserId: string, id: number): Promise<boolean> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return false;

    const rows = await db
      .delete(units)
      .where(and(eq(units.id, id), eq(units.lecturerId, lecturer.id)))
      .returning();
    return rows.length > 0;
  }

  async listUnitEnrollments(
    lecturerUserId: string,
    unitId: number
  ): Promise<{ enrollment: any; student: Student }[]> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return [];

    const unit = await db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.lecturerId, lecturer.id)));

    if (unit.length === 0) return [];

    return await db
      .select({ enrollment: enrollments, student: students })
      .from(enrollments)
      .innerJoin(students, eq(students.id, enrollments.studentId))
      .where(eq(enrollments.unitId, unitId))
      .orderBy(students.fullName);
  }

  async enrollStudentToUnit(
    lecturerUserId: string,
    unitId: number,
    input: { admissionNumber: string; fullName: string },
    mode: "normal" | "confirm"
  ): Promise<
    | { kind: "enrolled"; enrollment: any }
    | {
        kind: "needs_confirmation";
        student: Student;
        existingUnits: { unit: Unit; course: Course; department: Department }[];
      }
  > {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    const [unit] = await db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.lecturerId, lecturer.id)));

    if (!unit) {
      throw new Error("Unit not found");
    }

    let student = await this.getStudentByAdmissionNumber(input.admissionNumber);

    if (!student) {
      // Automatically create a user account for the student
      const [user] = await db
        .insert(users)
        .values({
          username: input.admissionNumber,
          password: "password123", // Default password
          role: "student",
          firstName: input.fullName.split(" ")[0],
          lastName: input.fullName.split(" ").slice(1).join(" ") || "",
        })
        .returning();

      student = await this.createStudent({
        userId: user.id,
        admissionNumber: input.admissionNumber,
        fullName: input.fullName,
        mustChangePassword: true,
        isActive: true,
      });
    }

    const existingEnrollments = await db
      .select({ unit: units, course: courses, department: departments })
      .from(enrollments)
      .innerJoin(units, eq(units.id, enrollments.unitId))
      .innerJoin(courses, eq(courses.id, units.courseId))
      .innerJoin(departments, eq(departments.id, courses.departmentId))
      .where(eq(enrollments.studentId, student.id));

    const alreadyInThisUnit = existingEnrollments.some((e) => e.unit.id === unitId);

    if (alreadyInThisUnit) {
      const [existing] = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.unitId, unitId), eq(enrollments.studentId, student.id)));
      return { kind: "enrolled", enrollment: existing };
    }

    if (existingEnrollments.length > 0 && mode === "normal") {
      return {
        kind: "needs_confirmation",
        student,
        existingUnits: existingEnrollments,
      };
    }

    const [enrollment] = await db.insert(enrollments).values({ unitId, studentId: student.id }).returning();

    await db.insert(notifications).values({
      studentId: student.id,
      unitId,
      message: `You have been enrolled in ${unit.title} (${unit.code}).`,
      severity: "info",
      isRead: false,
      metadata: { kind: "enrollment" },
    });

    return { kind: "enrolled", enrollment };
  }

  async listLecturerMaterials(lecturerUserId: string, unitId: number): Promise<Material[]> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return [];

    const [unit] = await db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.lecturerId, lecturer.id)));

    if (!unit) {
      return [];
    }

    return await db.select().from(materials).where(eq(materials.unitId, unitId)).orderBy(desc(materials.id));
  }

  async createMaterial(lecturerUserId: string, unitId: number, input: CreateMaterialRequest): Promise<Material> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) throw new Error("Lecturer not found");

    const [unit] = await db
      .select()
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.lecturerId, lecturer.id)));

    if (!unit) throw new Error("Unit not found");

    const [row] = await db
      .insert(materials)
      .values({
        ...input,
        unitId,
      })
      .returning();

    const enrolledStudentIds = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(eq(enrollments.unitId, unitId));

    if (enrolledStudentIds.length > 0) {
      await db.insert(notifications).values(
        enrolledStudentIds.map(({ studentId }) => ({
          studentId,
          unitId,
          materialId: row.id,
          message: `New material posted in ${unit.title}: ${row.title}`,
          severity: row.deadlineAt ? "warning" : "info",
          isRead: false,
          metadata: { kind: "material", materialType: row.type },
        }))
      );
    }

    return row;
  }

  async updateMaterial(
    lecturerUserId: string,
    id: number,
    updates: UpdateMaterialRequest
  ): Promise<Material | undefined> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return undefined;

    const [owned] = await db
      .select({ id: materials.id })
      .from(materials)
      .innerJoin(units, eq(units.id, materials.unitId))
      .where(and(eq(materials.id, id), eq(units.lecturerId, lecturer.id)));

    if (!owned) return undefined;

    const [row] = await db.update(materials).set(updates).where(eq(materials.id, id)).returning();
    return row;
  }

  async deleteMaterial(lecturerUserId: string, id: number): Promise<boolean> {
    const lecturer = await this.getLecturerByUserId(lecturerUserId);
    if (!lecturer) return false;

    const [owned] = await db
      .select({ id: materials.id })
      .from(materials)
      .innerJoin(units, eq(units.id, materials.unitId))
      .where(and(eq(materials.id, id), eq(units.lecturerId, lecturer.id)));

    if (!owned) return false;

    const rows = await db.delete(materials).where(eq(materials.id, id)).returning();
    return rows.length > 0;
  }

  async getStudentDashboard(studentUserId: string): Promise<
    | {
        student: Student;
        units: { unit: Unit; course: Course; department: Department; lecturer: Lecturer }[];
        unreadNotifications: number;
      }
    | undefined
  > {
    const student = await this.getStudentByUserId(studentUserId);
    if (!student) return undefined;

    const unitRows = await db
      .select({
        unit: units,
        course: courses,
        department: departments,
        lecturer: lecturers,
      })
      .from(enrollments)
      .innerJoin(units, eq(units.id, enrollments.unitId))
      .innerJoin(courses, eq(courses.id, units.courseId))
      .innerJoin(departments, eq(departments.id, courses.departmentId))
      .innerJoin(lecturers, eq(lecturers.id, units.lecturerId))
      .where(eq(enrollments.studentId, student.id))
      .orderBy(units.title);

    const unread = await db
      .select({ c: count(notifications.id).mapWith(Number).as("c") })
      .from(notifications)
      .where(and(eq(notifications.studentId, student.id), eq(notifications.isRead, false)));

    return {
      student,
      units: unitRows,
      unreadNotifications: unread[0]?.c ?? 0,
    };
  }

  async listStudentNotifications(
    studentUserId: string,
    query?: { unreadOnly?: boolean }
  ): Promise<Notification[]> {
    const student = await this.getStudentByUserId(studentUserId);
    if (!student) return [];

    const whereParts = [eq(notifications.studentId, student.id)];
    if (query?.unreadOnly) whereParts.push(eq(notifications.isRead, false));

    return await db
      .select()
      .from(notifications)
      .where(and(...whereParts))
      .orderBy(desc(notifications.id));
  }

  async markNotificationRead(studentUserId: string, notificationId: number): Promise<Notification | undefined> {
    const student = await this.getStudentByUserId(studentUserId);
    if (!student) return undefined;

    const [row] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.studentId, student.id)))
      .returning();
    return row;
  }

  async listStudentUnitMaterials(
    studentUserId: string,
    unitId: number
  ): Promise<{ material: Material; isLocked: boolean; lockReason?: string; timeToDeadlineSeconds?: number }[]> {
    const student = await this.getStudentByUserId(studentUserId);
    if (!student) return [];

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.unitId, unitId), eq(enrollments.studentId, student.id)));

    if (!enrollment) return [];

    const ms = await db.select().from(materials).where(eq(materials.unitId, unitId)).orderBy(desc(materials.id));

    const now = new Date();

    return ms.map((m) => {
      if (!m.deadlineAt) {
        return { material: m, isLocked: false };
      }
      const isLocked = m.deadlineAt.getTime() < now.getTime();
      const diffSeconds = Math.floor((m.deadlineAt.getTime() - now.getTime()) / 1000);
      if (isLocked) {
        return {
          material: m,
          isLocked: true,
          lockReason: "Deadline has passed",
        };
      }
      return {
        material: m,
        isLocked: false,
        timeToDeadlineSeconds: diffSeconds,
      };
    });
  }

  async getLecturerByUserId(userId: string): Promise<Lecturer | undefined> {
    const [row] = await db.select().from(lecturers).where(eq(lecturers.userId, userId));
    return row;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [row] = await db.select().from(students).where(eq(students.userId, userId));
    return row;
  }

  async seed(): Promise<void> {
    // Create admin user in the auth table
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        password: "password123",
        role: "admin",
        firstName: "System",
        lastName: "Administrator",
      })
      .onConflictDoNothing()
      .returning();

    // Create lecturer user
    await db
      .insert(users)
      .values({
        username: "BeTTI/LEC/001",
        password: "password123",
        role: "lecturer",
        firstName: "Alex",
        lastName: "Kiprotich",
      })
      .onConflictDoNothing();

    // Create student user
    await db
      .insert(users)
      .values({
        username: "SCM/6155/25S",
        password: "password123",
        role: "student",
        firstName: "Joyce",
        lastName: "Chebet",
      })
      .onConflictDoNothing();

    const existingDepartments = await db.select({ id: departments.id }).from(departments).limit(1);
    if (existingDepartments.length > 0) return;

    const [d1] = await db
      .insert(departments)
      .values([
        { name: "School of Computing & ICT", code: "SCIT" },
        { name: "School of Business", code: "SOB" },
      ])
      .returning();

    const deptRows = await db.select().from(departments).orderBy(departments.id);

    const scit = deptRows.find((d) => d.code === "SCIT")!;
    const sob = deptRows.find((d) => d.code === "SOB")!;

    const courseRows = await db
      .insert(courses)
      .values([
        { departmentId: scit.id, name: "Diploma in Software Engineering", code: "DSE" },
        { departmentId: scit.id, name: "Certificate in Computer Applications", code: "CCA" },
        { departmentId: sob.id, name: "Diploma in Supply Chain Management", code: "DSCM" },
      ])
      .returning();

    const [lecturer] = await db
      .insert(lecturers)
      .values({
        userId: "seed:lecturer1",
        staffNumber: "BeTTI/LEC/001",
        fullName: "Eng. Alex Kiprotich",
        departmentId: scit.id,
        isActive: true,
      })
      .returning();

    await this.setLecturerCourseAssignments(
      lecturer.id,
      courseRows.filter((c) => c.departmentId === scit.id).map((c) => c.id)
    );

    const [unit1] = await db
      .insert(units)
      .values({
        courseId: courseRows[0].id,
        lecturerId: lecturer.id,
        title: "Web Development Fundamentals",
        code: "WEB101",
        description: "Core web concepts: HTTP, HTML, CSS, and modern frontend workflows.",
        isActive: true,
      })
      .returning();

    const [student] = await db
      .insert(students)
      .values({
        userId: "seed:student1",
        admissionNumber: "SCM/6155/25S",
        fullName: "Joyce Chebet",
        mustChangePassword: true,
        isActive: true,
      })
      .returning();

    await db.insert(enrollments).values({ unitId: unit1.id, studentId: student.id });

    const [m1] = await db
      .insert(materials)
      .values({
        unitId: unit1.id,
        title: "Course Outline (PDF)",
        type: "pdf",
        instruction: "Read the outline and note the weekly topics. Submit your questions in the Q&A task by Friday.",
        url: "https://example.com/betti/course-outline.pdf",
        deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning();

    await db.insert(notifications).values({
      studentId: student.id,
      unitId: unit1.id,
      materialId: m1.id,
      message: "New material posted: Course Outline (PDF)",
      severity: "warning",
      isRead: false,
      metadata: { kind: "material", materialType: "pdf" },
    });
  }
}

export const storage = new DatabaseStorage();
