export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  name: string
  email: string
  registrationNumber: string
  role: UserRole
  avatar: string
  enrolledCourses?: string[]
  department?: string
  joinedAt: string
  status: "active" | "pending" | "suspended"
}

export interface Course {
  id: string
  title: string
  code: string
  description: string
  teacherId: string
  teacherName: string
  students: (string | User)[]
  materials: Material[]
  assignments: Assignment[]
  color: string
  semester: string
  credits: number
}

export interface Material {
  id: string
  courseId: string
  title: string
  type: "pdf" | "video" | "document" | "slide"
  uploadedAt: string
  size: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  submissions: Submission[]
}

export interface Submission {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  submittedAt: string
  grade?: number
  feedback?: string
  status: "submitted" | "graded" | "late" | "missing"
}

export interface LiveClass {
  id: string
  courseId: string
  courseName: string
  title: string
  scheduledAt: string
  duration: number
  status: "scheduled" | "live" | "ended"
  teacherId: string
  teacherName: string
  attendees: string[]
  description?: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  date: string
  status: "present" | "absent" | "late"
  markedBy: "auto" | "manual"
}

export interface Grade {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  courseCode: string
  assignmentId: string
  assignmentTitle: string
  score: number
  maxScore: number
  feedback: string
  gradedAt: string
}

export interface ChatConversation {
  id: string
  participants: { id: string; name: string; avatar: string; role: UserRole }[]
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  read: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "grade" | "material" | "class" | "assignment" | "system" | "attendance"
  read: boolean
  createdAt: string
  link?: string
}
