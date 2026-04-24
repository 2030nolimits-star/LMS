import type {
  User,
  Course,
  LiveClass,
  AttendanceRecord,
  Grade,
  ChatConversation,
  ChatMessage,
  Notification,
} from "./types"

// ─── Users ──────────────────────────────────────────────────────────
export const users: User[] = [
  {
    id: "u1",
    name: "Alice Johnson",
    email: "alice@university.edu",
    registrationNumber: "STU-2025-001",
    role: "student",
    avatar: "AJ",
    enrolledCourses: ["c1", "c2", "c3"],
    department: "Computer Science",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u2",
    name: "Bob Smith",
    email: "bob@university.edu",
    registrationNumber: "STU-2025-002",
    role: "student",
    avatar: "BS",
    enrolledCourses: ["c1", "c2"],
    department: "Computer Science",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u3",
    name: "Clara Davis",
    email: "clara@university.edu",
    registrationNumber: "STU-2025-003",
    role: "student",
    avatar: "CD",
    enrolledCourses: ["c1", "c3"],
    department: "Computer Science",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u4",
    name: "David Lee",
    email: "david@university.edu",
    registrationNumber: "STU-2025-004",
    role: "student",
    avatar: "DL",
    enrolledCourses: ["c2", "c3"],
    department: "Mathematics",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u5",
    name: "Eva Martinez",
    email: "eva@university.edu",
    registrationNumber: "STU-2025-005",
    role: "student",
    avatar: "EM",
    enrolledCourses: ["c1", "c2", "c3"],
    department: "Computer Science",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u6",
    name: "Frank Wilson",
    email: "frank@university.edu",
    registrationNumber: "STU-2025-006",
    role: "student",
    avatar: "FW",
    enrolledCourses: ["c1"],
    department: "Mathematics",
    joinedAt: "2025-09-15",
    status: "active",
  },
  {
    id: "u7",
    name: "Grace Kim",
    email: "grace@university.edu",
    registrationNumber: "STU-2025-007",
    role: "student",
    avatar: "GK",
    enrolledCourses: ["c2", "c3"],
    department: "Computer Science",
    joinedAt: "2025-09-01",
    status: "active",
  },
  {
    id: "u8",
    name: "Henry Chen",
    email: "henry@university.edu",
    registrationNumber: "STU-2025-008",
    role: "student",
    avatar: "HC",
    enrolledCourses: ["c1", "c2"],
    department: "Computer Science",
    joinedAt: "2025-09-15",
    status: "pending",
  },
  {
    id: "t1",
    name: "Dr. Sarah Thompson",
    email: "thompson@university.edu",
    registrationNumber: "TCH-2020-001",
    role: "teacher",
    avatar: "ST",
    department: "Computer Science",
    joinedAt: "2020-01-15",
    status: "active",
  },
  {
    id: "t2",
    name: "Prof. James Brown",
    email: "brown@university.edu",
    registrationNumber: "TCH-2019-002",
    role: "teacher",
    avatar: "JB",
    department: "Mathematics",
    joinedAt: "2019-08-20",
    status: "active",
  },
  {
    id: "a1",
    name: "Admin User",
    email: "admin@university.edu",
    registrationNumber: "ADM-2018-001",
    role: "admin",
    avatar: "AU",
    department: "Administration",
    joinedAt: "2018-06-01",
    status: "active",
  },
]

// ─── Courses ────────────────────────────────────────────────────────
export const courses: Course[] = [
  {
    id: "c1",
    title: "Introduction to Computer Science",
    code: "CS101",
    description:
      "A foundational course covering programming concepts, data structures, algorithms, and computational thinking.",
    teacherId: "t1",
    teacherName: "Dr. Sarah Thompson",
    students: ["u1", "u2", "u3", "u5", "u6", "u8"],
    color: "hsl(234, 89%, 58%)",
    semester: "Spring 2026",
    credits: 4,
    materials: [
      { id: "m1", courseId: "c1", title: "Week 1 - Introduction to Programming", type: "slide", uploadedAt: "2026-01-20", size: "2.4 MB" },
      { id: "m2", courseId: "c1", title: "Week 2 - Variables and Data Types", type: "pdf", uploadedAt: "2026-01-27", size: "1.8 MB" },
      { id: "m3", courseId: "c1", title: "Week 3 - Control Structures", type: "slide", uploadedAt: "2026-02-03", size: "3.1 MB" },
      { id: "m4", courseId: "c1", title: "Python Basics Video Lecture", type: "video", uploadedAt: "2026-02-05", size: "145 MB" },
      { id: "m5", courseId: "c1", title: "Week 4 - Functions and Modules", type: "document", uploadedAt: "2026-02-10", size: "950 KB" },
    ],
    assignments: [
      {
        id: "a1",
        courseId: "c1",
        title: "Assignment 1: Hello World Program",
        description: "Write your first Python program and submit the source file.",
        dueDate: "2026-02-01",
        maxScore: 100,
        submissions: [
          { id: "s1", studentId: "u1", studentName: "Alice Johnson", assignmentId: "a1", submittedAt: "2026-01-30", grade: 95, feedback: "Excellent work! Clean code structure.", status: "graded" },
          { id: "s2", studentId: "u2", studentName: "Bob Smith", assignmentId: "a1", submittedAt: "2026-01-31", grade: 88, feedback: "Good effort. Consider adding more comments.", status: "graded" },
          { id: "s3", studentId: "u3", studentName: "Clara Davis", assignmentId: "a1", submittedAt: "2026-02-02", grade: 78, feedback: "Submitted late, but good work overall.", status: "graded" },
          { id: "s4", studentId: "u5", studentName: "Eva Martinez", assignmentId: "a1", submittedAt: "2026-01-29", grade: 92, feedback: "Well done!", status: "graded" },
        ],
      },
      {
        id: "a2",
        courseId: "c1",
        title: "Assignment 2: Data Structures",
        description: "Implement a linked list and a stack using Python classes.",
        dueDate: "2026-02-15",
        maxScore: 100,
        submissions: [
          { id: "s5", studentId: "u1", studentName: "Alice Johnson", assignmentId: "a2", submittedAt: "2026-02-14", status: "submitted", grade: undefined, feedback: undefined },
          { id: "s6", studentId: "u2", studentName: "Bob Smith", assignmentId: "a2", submittedAt: "2026-02-14", status: "submitted", grade: undefined, feedback: undefined },
        ],
      },
      {
        id: "a3",
        courseId: "c1",
        title: "Assignment 3: Algorithm Analysis",
        description: "Analyze time and space complexity of common sorting algorithms.",
        dueDate: "2026-03-01",
        maxScore: 100,
        submissions: [],
      },
    ],
  },
  {
    id: "c2",
    title: "Calculus II",
    code: "MATH201",
    description:
      "Advanced calculus covering integration techniques, series, and multivariable calculus.",
    teacherId: "t2",
    teacherName: "Prof. James Brown",
    students: ["u1", "u2", "u4", "u5", "u7", "u8"],
    color: "hsl(160, 60%, 45%)",
    semester: "Spring 2026",
    credits: 3,
    materials: [
      { id: "m6", courseId: "c2", title: "Chapter 7 - Integration Techniques", type: "pdf", uploadedAt: "2026-01-22", size: "4.2 MB" },
      { id: "m7", courseId: "c2", title: "Practice Problems Set 1", type: "document", uploadedAt: "2026-01-28", size: "780 KB" },
      { id: "m8", courseId: "c2", title: "Series and Convergence", type: "slide", uploadedAt: "2026-02-04", size: "2.9 MB" },
    ],
    assignments: [
      {
        id: "a4",
        courseId: "c2",
        title: "Problem Set 1: Integration by Parts",
        description: "Solve 20 integration problems using integration by parts technique.",
        dueDate: "2026-02-08",
        maxScore: 100,
        submissions: [
          { id: "s7", studentId: "u1", studentName: "Alice Johnson", assignmentId: "a4", submittedAt: "2026-02-07", grade: 90, feedback: "Strong understanding of the technique.", status: "graded" },
          { id: "s8", studentId: "u2", studentName: "Bob Smith", assignmentId: "a4", submittedAt: "2026-02-08", grade: 75, feedback: "Review problems 12 and 15.", status: "graded" },
          { id: "s9", studentId: "u4", studentName: "David Lee", assignmentId: "a4", submittedAt: "2026-02-07", grade: 98, feedback: "Outstanding work.", status: "graded" },
        ],
      },
      {
        id: "a5",
        courseId: "c2",
        title: "Problem Set 2: Infinite Series",
        description: "Determine convergence/divergence of given series.",
        dueDate: "2026-02-22",
        maxScore: 100,
        submissions: [],
      },
    ],
  },
  {
    id: "c3",
    title: "Digital Logic Design",
    code: "EE201",
    description:
      "Introduction to digital systems, Boolean algebra, combinational and sequential circuits.",
    teacherId: "t1",
    teacherName: "Dr. Sarah Thompson",
    students: ["u1", "u3", "u4", "u5", "u7"],
    color: "hsl(38, 92%, 50%)",
    semester: "Spring 2026",
    credits: 3,
    materials: [
      { id: "m9", courseId: "c3", title: "Boolean Algebra Fundamentals", type: "pdf", uploadedAt: "2026-01-21", size: "3.5 MB" },
      { id: "m10", courseId: "c3", title: "Logic Gates Simulation Lab", type: "document", uploadedAt: "2026-01-30", size: "1.2 MB" },
    ],
    assignments: [
      {
        id: "a6",
        courseId: "c3",
        title: "Lab 1: Logic Gate Simulation",
        description: "Use the provided simulator to build AND, OR, NOT, XOR gates.",
        dueDate: "2026-02-10",
        maxScore: 50,
        submissions: [
          { id: "s10", studentId: "u1", studentName: "Alice Johnson", assignmentId: "a6", submittedAt: "2026-02-09", grade: 48, feedback: "Excellent lab work.", status: "graded" },
          { id: "s11", studentId: "u3", studentName: "Clara Davis", assignmentId: "a6", submittedAt: "2026-02-10", grade: 42, feedback: "Good. XOR gate had a minor error.", status: "graded" },
          { id: "s12", studentId: "u5", studentName: "Eva Martinez", assignmentId: "a6", submittedAt: "2026-02-09", grade: 50, feedback: "Perfect score!", status: "graded" },
        ],
      },
    ],
  },
]

// ─── Live Classes ───────────────────────────────────────────────────
export const liveClasses: LiveClass[] = [
  {
    id: "lc1",
    courseId: "c1",
    courseName: "Data Structures & Algorithms",
    title: "Graph Algorithms Deep Dive",
    scheduledAt: new Date().toISOString(),
    duration: 90,
    status: "live",
    teacherId: "t1",
    teacherName: "Dr. James Carter",
    attendees: ["u1", "u2", "u3", "u5"],
    description: "Deep dive into advanced graph algorithms including Dijkstra, A*, and Network Flow.",
  },
  {
    id: "lc2",
    courseId: "c2",
    courseName: "Linear Algebra",
    title: "Eigenvectors & Eigenvalues",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    duration: 60,
    status: "scheduled",
    teacherId: "t2",
    teacherName: "Prof. Sarah Kim",
    attendees: [],
    description: "Understanding the geometric and algebraic significance of eigenvectors.",
  },
  {
    id: "lc3",
    courseId: "c3",
    courseName: "Machine Learning",
    title: "Neural Network Backprop",
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    duration: 120,
    status: "scheduled",
    teacherId: "t1",
    teacherName: "Dr. Ahmed Hassan",
    attendees: [],
    description: "Step-by-step derivation of the backpropagation algorithm.",
  },
  {
    id: "lc5",
    courseId: "c1",
    courseName: "Engineering Physics",
    title: "Quantum State Superposition",
    scheduledAt: new Date(Date.now() - 400000000).toISOString(),
    duration: 60,
    status: "ended",
    teacherId: "t1",
    teacherName: "Prof. Linda Osei",
    attendees: ["u1", "u2", "u3", "u5", "u6"],
    description: "Foundational concepts of quantum mechanics.",
  },
]

// ─── Attendance ─────────────────────────────────────────────────────
export const attendanceRecords: AttendanceRecord[] = [
  // CS101
  { id: "att1", studentId: "u1", studentName: "Alice Johnson", courseId: "c1", courseName: "CS101", date: "2026-02-03", status: "present", markedBy: "auto" },
  { id: "att2", studentId: "u2", studentName: "Bob Smith", courseId: "c1", courseName: "CS101", date: "2026-02-03", status: "present", markedBy: "auto" },
  { id: "att3", studentId: "u3", studentName: "Clara Davis", courseId: "c1", courseName: "CS101", date: "2026-02-03", status: "late", markedBy: "manual" },
  { id: "att4", studentId: "u5", studentName: "Eva Martinez", courseId: "c1", courseName: "CS101", date: "2026-02-03", status: "present", markedBy: "auto" },
  { id: "att5", studentId: "u6", studentName: "Frank Wilson", courseId: "c1", courseName: "CS101", date: "2026-02-03", status: "absent", markedBy: "manual" },
  { id: "att6", studentId: "u1", studentName: "Alice Johnson", courseId: "c1", courseName: "CS101", date: "2026-02-10", status: "present", markedBy: "auto" },
  { id: "att7", studentId: "u2", studentName: "Bob Smith", courseId: "c1", courseName: "CS101", date: "2026-02-10", status: "absent", markedBy: "manual" },
  { id: "att8", studentId: "u3", studentName: "Clara Davis", courseId: "c1", courseName: "CS101", date: "2026-02-10", status: "present", markedBy: "auto" },
  { id: "att9", studentId: "u5", studentName: "Eva Martinez", courseId: "c1", courseName: "CS101", date: "2026-02-10", status: "present", markedBy: "auto" },
  { id: "att10", studentId: "u6", studentName: "Frank Wilson", courseId: "c1", courseName: "CS101", date: "2026-02-10", status: "present", markedBy: "auto" },
  // MATH201
  { id: "att11", studentId: "u1", studentName: "Alice Johnson", courseId: "c2", courseName: "MATH201", date: "2026-02-04", status: "present", markedBy: "auto" },
  { id: "att12", studentId: "u2", studentName: "Bob Smith", courseId: "c2", courseName: "MATH201", date: "2026-02-04", status: "present", markedBy: "auto" },
  { id: "att13", studentId: "u4", studentName: "David Lee", courseId: "c2", courseName: "MATH201", date: "2026-02-04", status: "present", markedBy: "auto" },
  { id: "att14", studentId: "u5", studentName: "Eva Martinez", courseId: "c2", courseName: "MATH201", date: "2026-02-04", status: "late", markedBy: "manual" },
  { id: "att15", studentId: "u7", studentName: "Grace Kim", courseId: "c2", courseName: "MATH201", date: "2026-02-04", status: "absent", markedBy: "manual" },
  // EE201
  { id: "att16", studentId: "u1", studentName: "Alice Johnson", courseId: "c3", courseName: "EE201", date: "2026-02-05", status: "present", markedBy: "auto" },
  { id: "att17", studentId: "u3", studentName: "Clara Davis", courseId: "c3", courseName: "EE201", date: "2026-02-05", status: "present", markedBy: "auto" },
  { id: "att18", studentId: "u4", studentName: "David Lee", courseId: "c3", courseName: "EE201", date: "2026-02-05", status: "present", markedBy: "auto" },
  { id: "att19", studentId: "u5", studentName: "Eva Martinez", courseId: "c3", courseName: "EE201", date: "2026-02-05", status: "present", markedBy: "auto" },
  { id: "att20", studentId: "u7", studentName: "Grace Kim", courseId: "c3", courseName: "EE201", date: "2026-02-05", status: "late", markedBy: "manual" },
]

// ─── Grades ─────────────────────────────────────────────────────────
export const grades: Grade[] = [
  { id: "g1", studentId: "u1", studentName: "Alice Johnson", courseId: "c1", courseName: "Introduction to Computer Science", courseCode: "CS101", assignmentId: "a1", assignmentTitle: "Assignment 1: Hello World Program", score: 95, maxScore: 100, feedback: "Excellent work! Clean code structure.", gradedAt: "2026-02-03" },
  { id: "g2", studentId: "u1", studentName: "Alice Johnson", courseId: "c2", courseName: "Calculus II", courseCode: "MATH201", assignmentId: "a4", assignmentTitle: "Problem Set 1: Integration by Parts", score: 90, maxScore: 100, feedback: "Strong understanding of the technique.", gradedAt: "2026-02-10" },
  { id: "g3", studentId: "u1", studentName: "Alice Johnson", courseId: "c3", courseName: "Digital Logic Design", courseCode: "EE201", assignmentId: "a6", assignmentTitle: "Lab 1: Logic Gate Simulation", score: 48, maxScore: 50, feedback: "Excellent lab work.", gradedAt: "2026-02-12" },
  { id: "g4", studentId: "u2", studentName: "Bob Smith", courseId: "c1", courseName: "Introduction to Computer Science", courseCode: "CS101", assignmentId: "a1", assignmentTitle: "Assignment 1: Hello World Program", score: 88, maxScore: 100, feedback: "Good effort. Consider adding more comments.", gradedAt: "2026-02-03" },
  { id: "g5", studentId: "u2", studentName: "Bob Smith", courseId: "c2", courseName: "Calculus II", courseCode: "MATH201", assignmentId: "a4", assignmentTitle: "Problem Set 1: Integration by Parts", score: 75, maxScore: 100, feedback: "Review problems 12 and 15.", gradedAt: "2026-02-10" },
  { id: "g6", studentId: "u3", studentName: "Clara Davis", courseId: "c1", courseName: "Introduction to Computer Science", courseCode: "CS101", assignmentId: "a1", assignmentTitle: "Assignment 1: Hello World Program", score: 78, maxScore: 100, feedback: "Submitted late, but good work overall.", gradedAt: "2026-02-03" },
  { id: "g7", studentId: "u3", studentName: "Clara Davis", courseId: "c3", courseName: "Digital Logic Design", courseCode: "EE201", assignmentId: "a6", assignmentTitle: "Lab 1: Logic Gate Simulation", score: 42, maxScore: 50, feedback: "Good. XOR gate had a minor error.", gradedAt: "2026-02-12" },
  { id: "g8", studentId: "u4", studentName: "David Lee", courseId: "c2", courseName: "Calculus II", courseCode: "MATH201", assignmentId: "a4", assignmentTitle: "Problem Set 1: Integration by Parts", score: 98, maxScore: 100, feedback: "Outstanding work.", gradedAt: "2026-02-10" },
  { id: "g9", studentId: "u5", studentName: "Eva Martinez", courseId: "c1", courseName: "Introduction to Computer Science", courseCode: "CS101", assignmentId: "a1", assignmentTitle: "Assignment 1: Hello World Program", score: 92, maxScore: 100, feedback: "Well done!", gradedAt: "2026-02-03" },
  { id: "g10", studentId: "u5", studentName: "Eva Martinez", courseId: "c3", courseName: "Digital Logic Design", courseCode: "EE201", assignmentId: "a6", assignmentTitle: "Lab 1: Logic Gate Simulation", score: 50, maxScore: 50, feedback: "Perfect score!", gradedAt: "2026-02-12" },
]

// ─── Chat ────────────────────────────────────────────────────────────
export const chatConversations: ChatConversation[] = [
  {
    id: "conv1",
    participants: [
      { id: "u1", name: "Alice Johnson", avatar: "AJ", role: "student" },
      { id: "t1", name: "Dr. Sarah Thompson", avatar: "ST", role: "teacher" },
    ],
    lastMessage: "Thank you for the feedback on my assignment!",
    lastMessageAt: "2026-02-16T14:30:00",
    unreadCount: 0,
  },
  {
    id: "conv2",
    participants: [
      { id: "u2", name: "Bob Smith", avatar: "BS", role: "student" },
      { id: "t1", name: "Dr. Sarah Thompson", avatar: "ST", role: "teacher" },
    ],
    lastMessage: "Could I get an extension on Assignment 2?",
    lastMessageAt: "2026-02-16T11:20:00",
    unreadCount: 1,
  },
  {
    id: "conv3",
    participants: [
      { id: "u1", name: "Alice Johnson", avatar: "AJ", role: "student" },
      { id: "t2", name: "Prof. James Brown", avatar: "JB", role: "teacher" },
    ],
    lastMessage: "The series convergence review will be very helpful.",
    lastMessageAt: "2026-02-15T16:45:00",
    unreadCount: 2,
  },
  {
    id: "conv4",
    participants: [
      { id: "u3", name: "Clara Davis", avatar: "CD", role: "student" },
      { id: "t1", name: "Dr. Sarah Thompson", avatar: "ST", role: "teacher" },
    ],
    lastMessage: "I fixed the XOR gate issue. Can I resubmit?",
    lastMessageAt: "2026-02-14T09:10:00",
    unreadCount: 0,
  },
]

export const chatMessages: ChatMessage[] = [
  // conv1: Alice <-> Dr. Thompson
  { id: "msg1", conversationId: "conv1", senderId: "t1", senderName: "Dr. Sarah Thompson", senderAvatar: "ST", content: "Hi Alice, great work on your Assignment 1. Your code was very clean.", timestamp: "2026-02-16T13:00:00", read: true },
  { id: "msg2", conversationId: "conv1", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Thank you, Dr. Thompson! I really enjoyed working on it.", timestamp: "2026-02-16T13:15:00", read: true },
  { id: "msg3", conversationId: "conv1", senderId: "t1", senderName: "Dr. Sarah Thompson", senderAvatar: "ST", content: "For Assignment 2, make sure to handle edge cases in your linked list implementation.", timestamp: "2026-02-16T14:00:00", read: true },
  { id: "msg4", conversationId: "conv1", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Thank you for the feedback on my assignment!", timestamp: "2026-02-16T14:30:00", read: true },
  // conv2: Bob <-> Dr. Thompson
  { id: "msg5", conversationId: "conv2", senderId: "u2", senderName: "Bob Smith", senderAvatar: "BS", content: "Hi Dr. Thompson, I have been having some trouble with the data structures assignment.", timestamp: "2026-02-16T10:00:00", read: true },
  { id: "msg6", conversationId: "conv2", senderId: "t1", senderName: "Dr. Sarah Thompson", senderAvatar: "ST", content: "What specifically are you struggling with?", timestamp: "2026-02-16T10:30:00", read: true },
  { id: "msg7", conversationId: "conv2", senderId: "u2", senderName: "Bob Smith", senderAvatar: "BS", content: "Could I get an extension on Assignment 2?", timestamp: "2026-02-16T11:20:00", read: false },
  // conv3: Alice <-> Prof. Brown
  { id: "msg8", conversationId: "conv3", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "Prof. Brown, will the upcoming session cover the ratio test in detail?", timestamp: "2026-02-15T15:00:00", read: true },
  { id: "msg9", conversationId: "conv3", senderId: "t2", senderName: "Prof. James Brown", senderAvatar: "JB", content: "Yes! We will go through ratio test, root test, and comparison tests.", timestamp: "2026-02-15T15:30:00", read: false },
  { id: "msg10", conversationId: "conv3", senderId: "u1", senderName: "Alice Johnson", senderAvatar: "AJ", content: "The series convergence review will be very helpful.", timestamp: "2026-02-15T16:45:00", read: false },
]

// ─── Notifications ──────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: "n1", userId: "u1", title: "Grade Posted", message: "Your grade for Assignment 1 in CS101 has been posted.", type: "grade", read: false, createdAt: "2026-02-16T09:00:00", link: "/student/grades" },
  { id: "n2", userId: "u1", title: "New Material", message: "Week 4 notes have been uploaded for CS101.", type: "material", read: false, createdAt: "2026-02-15T16:00:00", link: "/student/courses/c1" },
  { id: "n3", userId: "u1", title: "Live Class Starting", message: "Functions & Scope live session starts in 30 minutes.", type: "class", read: true, createdAt: "2026-02-17T09:30:00", link: "/student/live-classes/lc1" },
  { id: "n4", userId: "u1", title: "Assignment Due", message: "Assignment 2: Data Structures is due tomorrow.", type: "assignment", read: true, createdAt: "2026-02-14T08:00:00", link: "/student/courses/c1" },
  { id: "n5", userId: "u1", title: "Attendance Recorded", message: "Your attendance for CS101 on Feb 10 has been recorded.", type: "attendance", read: true, createdAt: "2026-02-10T11:00:00", link: "/student/attendance" },
  // Teacher notifications
  { id: "n6", userId: "t1", title: "New Submission", message: "Alice Johnson submitted Assignment 2 in CS101.", type: "assignment", read: false, createdAt: "2026-02-14T15:00:00", link: "/teacher/courses/c1" },
  { id: "n7", userId: "t1", title: "Extension Request", message: "Bob Smith requested an extension for Assignment 2.", type: "system", read: false, createdAt: "2026-02-16T11:20:00", link: "/teacher/chat" },
  { id: "n8", userId: "t1", title: "Live Class Reminder", message: "Functions & Scope live session starts in 1 hour.", type: "class", read: true, createdAt: "2026-02-17T09:00:00", link: "/teacher/live-classes/lc1" },
  // Admin notifications
  { id: "n9", userId: "a1", title: "New Registration", message: "Henry Chen (STU-2025-008) has registered and awaits approval.", type: "system", read: false, createdAt: "2026-02-16T08:00:00", link: "/admin/users" },
  { id: "n10", userId: "a1", title: "System Update", message: "Platform maintenance scheduled for Feb 20 at midnight.", type: "system", read: true, createdAt: "2026-02-15T10:00:00" },
]

export const mockProfiles: any[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@university.edu', role: 'student', registration_number: '4332351', department: 'Computer Science', status: 'active', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', name: 'Dr. Sarah Thompson', email: 'thompson@university.edu', role: 'teacher', registration_number: 'TCH-8821', department: 'Computer Science', status: 'active', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u3', name: 'Prof. James Carter', email: 'carter@university.edu', role: 'teacher', registration_number: 'TCH-9942', department: 'Mathematics', status: 'active', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u4', name: 'Bob Smith', email: 'bob@university.edu', role: 'student', registration_number: '4332352', department: 'Physics', status: 'pending', created_at: '2026-02-15T10:30:00Z' },
  { id: 'u5', name: 'Admin User', email: 'admin@university.edu', role: 'admin', registration_number: 'ADM-001', department: 'Administration', status: 'active', created_at: '2026-01-01T00:00:00Z' }
];

export const mockSubmissions: any[] = [
  { id: 'sub-1', studentName: 'Alice Johnson', studentReg: '4332351', assignmentTitle: 'Assignment 2: Data Structures', courseTitle: 'Data Structures & Algorithms', submitted_at: '2026-02-14T15:00:00Z', maxScore: 100, grade: 0, feedback: '', assignment: { course_id: 'c1' } },
  { id: 'sub-2', studentName: 'Bob Smith', studentReg: '4332352', assignmentTitle: 'Assignment 2: Data Structures', courseTitle: 'Data Structures & Algorithms', submitted_at: '2026-02-16T11:20:00Z', maxScore: 100, grade: 0, feedback: '', assignment: { course_id: 'c1' } }
];
