import { supabase } from "./supabase";
import type { Course, LiveClass, Grade, Material, User, Notification } from "./types";
import { 
  users as mockUsers, 
  courses as mockCourses, 
  liveClasses as mockLiveClasses, 
  attendanceRecords, 
  grades as mockGrades, 
  chatConversations, 
  chatMessages, 
  notifications as mockNotifications 
} from "./mock-data";

/**
 * MOCK DATA QUERIES
 * This provides a high-fidelity demonstration by bypassing the empty database
 * and using rich in-memory mock data. Mutations are saved in memory so the 
 * app feels fully interactive during the session.
 */

let mUsers = [...mockUsers];
let mCourses = [...mockCourses];
let mLiveClasses = [...mockLiveClasses];
let mAttendance = [...attendanceRecords];
let mGrades = [...mockGrades];
let mConversations = [...chatConversations];
let mMessages = [...chatMessages];
let mNotifications = [...mockNotifications];
let mSubmissions: any[] = [];

// Helper to simulate network latency
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// --- Profiles ---
export async function getProfile(userId: string): Promise<User | null> {
  await delay();
  // If the actual user isn't in mock data, return the first mock user of the same role (or teacher)
  return mUsers.find(u => u.id === userId) || mUsers.find(u => u.role === "teacher") || null;
}

// --- Courses ---
export async function getStudentCourses(studentId: string): Promise<Course[]> {
  await delay();
  return mCourses; // For demo, return all courses
}

export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  await delay();
  // For demo, return all mock courses so the teacher has data
  return mCourses;
}

// --- Live Classes ---
export async function getUpcomingLiveClasses(courseIds: string[]): Promise<LiveClass[]> {
  await delay();
  return mLiveClasses.filter(lc => lc.status !== "ended");
}

export async function getTeacherLiveClasses(teacherId: string): Promise<LiveClass[]> {
  await delay();
  return mLiveClasses; // Return all for demo
}

export async function scheduleLiveClass(classData: Partial<LiveClass>) {
  await delay();
  const newClass = {
    id: `lc_${Date.now()}`,
    ...classData,
    status: "scheduled",
    courseName: mCourses.find(c => c.id === classData.courseId)?.title || "Unknown",
    teacherName: "Demo Teacher",
    attendees: []
  } as LiveClass;
  mLiveClasses.push(newClass);

  // Notify students
  mUsers.filter(u => u.role === "student").forEach(s => {
    mNotifications.unshift({
      id: `n_${Date.now()}_${s.id}`,
      userId: s.id,
      title: "Live Class Scheduled",
      message: `${newClass.title} has been scheduled.`,
      type: "class",
      read: false,
      createdAt: new Date().toISOString(),
      link: `/dashboard/student/live-classes`
    } as Notification);
  });

  return newClass;
}

export async function getLiveClassById(id: string) {
  await delay();
  return mLiveClasses.find(lc => lc.id === id) || null;
}

// --- Grades & Submissions ---
export async function getStudentGrades(studentId: string): Promise<Grade[]> {
  await delay();
  return mGrades;
}

export async function getPendingSubmissions(teacherId: string) {
  await delay();
  // Return mock pending submissions
  const pending = [];
  mCourses.forEach(c => {
    c.assignments?.forEach(a => {
      a.submissions?.forEach(s => {
        if (s.status === "submitted" || s.status === "pending") {
          pending.push({
            ...s,
            assignmentTitle: a.title,
            courseTitle: c.title,
            maxScore: a.maxScore
          });
        }
      });
    });
  });
  // Add some fake ones if none exist
  if (pending.length === 0) {
    pending.push({
      id: "sub_demo_1",
      studentId: "u1",
      studentName: "Alice Johnson",
      registrationNumber: "STU-2025-001",
      assignmentId: "a2",
      assignmentTitle: "Assignment 2: Data Structures",
      courseTitle: "Introduction to Computer Science",
      status: "submitted",
      submittedAt: new Date().toISOString(),
      maxScore: 100
    });
  }
  return pending as any[];
}

export async function submitGrade(submissionId: string, grade: number, feedback: string) {
  await delay();
  // Create a new grade entry in our mock memory
  mGrades.push({
    id: `g_${Date.now()}`,
    studentId: "u1",
    studentName: "Alice Johnson",
    courseId: "c1",
    courseName: "Introduction to Computer Science",
    courseCode: "CS101",
    assignmentId: "a2",
    assignmentTitle: "Assignment 2: Data Structures",
    score: grade,
    maxScore: 100,
    feedback,
    gradedAt: new Date().toISOString()
  });

  // Notify the student
  mNotifications.unshift({
    id: `n_${Date.now()}`,
    userId: "u1",
    title: "Grade Posted",
    message: `You received ${grade}/100 on your assignment.`,
    type: "grade",
    read: false,
    createdAt: new Date().toISOString(),
    link: "/dashboard/student/grades"
  } as Notification);
}

// --- Materials ---
export async function uploadMaterial(materialData: Partial<Material>) {
  await delay();
  const course = mCourses.find(c => c.id === materialData.courseId || c.id === (materialData as any).course_id);
  const newMaterial = {
    id: `m_${Date.now()}`,
    courseId: course?.id || "c1",
    title: materialData.title || "Untitled",
    type: materialData.type || "document",
    uploadedAt: new Date().toISOString(),
    size: (materialData as any).file_size || "1.2 MB",
    courseTitle: course?.title,
    courseCode: course?.code
  };
  
  if (course) {
    if (!course.materials) course.materials = [];
    course.materials.push(newMaterial as any);
  }

  // Notify students
  mUsers.filter(u => u.role === "student").forEach(s => {
    mNotifications.unshift({
      id: `n_${Date.now()}_${s.id}`,
      userId: s.id,
      title: "New Material Uploaded",
      message: `${newMaterial.title} has been added to ${course?.title || 'your course'}.`,
      type: "material",
      read: false,
      createdAt: new Date().toISOString(),
      link: `/dashboard/student/courses`
    } as Notification);
  });

  return newMaterial;
}

// --- Teacher Dashboard Stats ---
export async function getTeacherDashboardData(teacherId: string) {
  await delay();
  return {
    courses: mCourses,
    totalStudents: mUsers.filter(u => u.role === "student").length,
    pendingGrading: await getPendingSubmissions(teacherId).then(res => res.length)
  };
}

export async function getCourseStudents(courseId: string): Promise<User[]> {
  await delay();
  return mUsers.filter(u => u.role === "student");
}

// --- Admin System Stats ---
export async function getAdminDashboardData() {
  await delay();
  return {
    students: mUsers.filter(u => u.role === "student").length,
    teachers: mUsers.filter(u => u.role === "teacher").length,
    courses: mCourses.length,
    pending: mUsers.filter(u => u.status === "pending"),
    activeLive: mLiveClasses.filter(lc => lc.status === "live"),
    attendanceRate: 85,
    attendanceRaw: mAttendance,
    submissionsRaw: [],
    coursesRaw: mCourses
  };
}

export async function updateUserStatus(userId: string, status: "active" | "rejected") {
  await delay();
  const u = mUsers.find(u => u.id === userId);
  if (u) u.status = status;
  return u;
}

export async function createCourse(courseData: Partial<Course>) {
  await delay();
  const c = { id: `c_${Date.now()}`, ...courseData } as Course;
  mCourses.push(c);
  return c;
}

export async function deleteCourse(id: string) {
  await delay();
  mCourses = mCourses.filter(c => c.id !== id);
}

// --- Messaging & Chat ---
export async function getConversations(userId: string) {
  await delay();
  return mConversations;
}

export async function getMessages(userId: string, otherId: string) {
  await delay();
  return mMessages;
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  await delay();
  const msg = {
    id: `msg_${Date.now()}`,
    conversationId: "conv1",
    senderId,
    senderName: "You",
    senderAvatar: "Y",
    content,
    timestamp: new Date().toISOString(),
    read: true
  };
  mMessages.push(msg as any);
  return msg;
}

// --- Notifications ---
export async function getNotifications(userId: string) {
  await delay();
  return mNotifications.filter(n => n.userId === userId || userId === "t1" || userId === "u1"); // Return some for demo
}

export async function markNotificationAsRead(notificationId: string) {
  await delay();
  const n = mNotifications.find(n => n.id === notificationId);
  if (n) n.read = true;
}

export async function getUnreadNotificationCount(userId: string) {
  await delay();
  return mNotifications.filter(n => !n.read).length;
}

export async function getStudentAttendance(studentId: string) {
  await delay();
  return mAttendance.filter(a => a.studentId === studentId || studentId === "u1");
}

export async function bulkMarkAttendance(records: any[]) {
  await delay();
  mAttendance.push(...records.map(r => ({ ...r, id: `att_${Date.now()}` })));
}

export async function getAllUsers() {
  await delay();
  return mUsers;
}

export async function publishGlobalNotification(title: string, message: string, type: "info" | "success" | "warning") {
  await delay();
  mUsers.forEach(u => {
    mNotifications.unshift({
      id: `n_${Date.now()}_${u.id}`,
      userId: u.id,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    } as Notification);
  });
}
