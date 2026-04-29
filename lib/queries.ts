import { supabase } from "./supabase";
import type { Course, LiveClass, Grade, Material, User } from "./types";
import * as mock from "./mock-data";

/**
 * CORE DATA QUERIES
 * Consolidated and sanitized by AegisAI
 */

// --- Profiles ---
export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error || !data) {
    return mock.users.find(u => u.id === userId) || null;
  }
  return data as User;
}

// --- Courses ---
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, profiles (name)");
  
  if (error || !data || data.length === 0) return mock.courses;
  return data.map(c => ({
    ...c,
    teacherName: (c as any).profiles?.name || "Unknown Instructor"
  })) as Course[];
}

export async function enrollInCourse(studentId: string, courseId: string) {
  // Demo Mode
  if (studentId.startsWith('u') && studentId.length < 5) {
    const existing = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
    localStorage.setItem('demo-enrollments', JSON.stringify([...existing, { student_id: studentId, course_id: courseId }]));
    return;
  }

  const { error } = await supabase
    .from("enrollments")
    .insert([{ student_id: studentId, course_id: courseId }]);
  
  if (error) throw error;
}

export async function getStudentCourses(studentId: string): Promise<Course[]> {
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", studentId);

  if (enrollError || !enrollments || enrollments.length === 0) {
    return mock.courses.filter(c => c.students.includes(studentId) || studentId === "u1");
  }
  const courseIds = enrollments.map(e => e.course_id);
  
  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("*, materials (*), assignments (*), profiles (name)")
    .in("id", courseIds);

  if (courseError || !courses || courses.length === 0) return mock.courses.slice(0, 3);
  return courses.map(c => ({
    ...c,
    teacherName: (c as any).profiles?.name || "Unknown Instructor"
  })) as Course[];
}

export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, materials (*), assignments (*)")
    .eq("teacher_id", teacherId);

  if (error || !data || data.length === 0) {
    return mock.courses.filter(c => c.teacherId === teacherId || teacherId === "t1");
  }
  return data.map(c => ({
    ...c,
    teacherId: (c as any).teacher_id,
    materials: (c as any).materials?.map((m: any) => ({
      ...m,
      courseId: m.course_id,
      size: m.file_size,
      uploadedAt: m.created_at
    })) || [],
    assignments: (c as any).assignments?.map((a: any) => ({
      ...a,
      dueDate: a.due_date,
      maxScore: a.max_score
    })) || []
  })) as Course[];
}

// --- Live Classes ---
export async function getUpcomingLiveClasses(courseIds: string[]): Promise<LiveClass[]> {
  const { data, error } = await supabase
    .from("live_classes")
    .select("*, courses (title)")
    .in("course_id", courseIds)
    .neq("status", "ended")
    .order("scheduled_at", { ascending: true });

  const mockClasses = mock.liveClasses.filter(lc => {
    if (courseIds.length === 0) return lc.status !== "ended";
    return courseIds.includes(lc.courseId) && lc.status !== "ended";
  });

  // Apply localStorage overrides for demo persistence
  const overriddenClasses = mockClasses.map(lc => {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem(`live-class-status-${lc.id}`);
      if (savedStatus) return { ...lc, status: savedStatus as any };
    }
    return lc;
  });

  // Merge with locally created demo classes
  let allMockClasses = [...overriddenClasses];
  if (typeof window !== 'undefined') {
    const demoClasses = JSON.parse(localStorage.getItem('demo-live-classes') || '[]');
    allMockClasses = [...allMockClasses, ...demoClasses];
  }

  if (error || !data || data.length === 0) {
    return allMockClasses as LiveClass[];
  }

  return data.map(lc => ({
    ...lc,
    courseName: (lc as any).courses?.title || "Unknown Course",
    scheduledAt: lc.scheduled_at,
    courseId: lc.course_id
  })) as LiveClass[];
}

// --- Grades & Submissions ---
export async function getAssignmentById(assignmentId: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*, courses (title, code, teacher_id, profiles!courses_teacher_id_fkey(name))")
    .eq("id", assignmentId)
    .single();
  
  if (error || !data) {
    const mockAssignment = mock.courses.flatMap(c => c.assignments).find(a => a.id === assignmentId);
    if (mockAssignment) {
      const course = mock.courses.find(c => c.id === mockAssignment.courseId);
      return {
        ...mockAssignment,
        courseTitle: course?.title,
        courseName: course?.title,
        courseCode: course?.code,
        teacherName: course?.teacherName,
        teacherId: course?.teacherId
      };
    }
    return null;
  }
  return {
    ...data,
    courseTitle: data.courses?.title,
    courseName: data.courses?.title,
    courseCode: data.courses?.code,
    teacherName: data.courses?.profiles?.name,
    teacherId: data.courses?.teacher_id
  };
}

export async function getStudentGrades(studentId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, assignments (title, max_score, courses (title, code))")
    .eq("student_id", studentId)
    .eq("status", "graded");

  if (error) return [];
  return data.map(s => ({
    id: s.id,
    studentId: s.student_id,
    courseName: (s as any).assignments?.courses?.title,
    courseCode: (s as any).assignments?.courses?.code,
    assignmentTitle: (s as any).assignments?.title,
    score: s.grade,
    maxScore: (s as any).assignments?.max_score,
    gradedAt: s.submitted_at
  })) as any[];
}

// --- Teacher Dashboard Stats ---
export async function getTeacherDashboardData(teacherId: string) {
  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select(`
      *, 
      assignments (*, submissions (*)), 
      materials (*), 
      enrollments (*, profiles:student_id (*))
    `)
    .eq("teacher_id", teacherId);

  if (courseError || !courses || courses.length === 0) {
    const mockCourses = mock.courses
      .filter(c => c.teacherId === teacherId || teacherId === "t1")
      .map(c => ({
        ...c,
        students: (c.students as string[]).map(sid => mock.users.find(u => u.id === sid) || { 
          id: sid, 
          name: "Unknown Student", 
          email: "", 
          role: "student", 
          status: "active", 
          registrationNumber: "N/A", 
          avatar: "U", 
          joinedAt: new Date().toISOString() 
        } as User)
      }));

    let pendingGrading = 0;
    mockCourses.forEach(c => {
      c.assignments.forEach(a => {
        pendingGrading += a.submissions.filter(s => s.status === "submitted").length;
      });
    });
    const totalStudents = new Set(mockCourses.flatMap(c => c.students.map((s: any) => s.id))).size;
    return { courses: mockCourses, totalStudents, pendingGrading };
  }

  let pendingGrading = 0;
  courses.forEach(course => {
    course.assignments?.forEach((a: any) => {
      pendingGrading += a.submissions?.filter((s: any) => s.status === "submitted").length || 0;
    });
  });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id")
    .in("course_id", courses.map(c => c.id));
  
  const totalStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

  return {
    courses: courses.map(c => ({
      ...c,
      teacherId: (c as any).teacher_id,
      students: (c as any).enrollments?.map((e: any) => ({
        ...e.profiles,
        registrationNumber: e.profiles?.registration_number || e.profiles?.registrationNumber
      })) || [],
      assignments: (c as any).assignments?.map((a: any) => ({
        ...a,
        dueDate: a.due_date,
        maxScore: a.max_score
      })) || [],
      materials: (c as any).materials?.map((m: any) => ({
        ...m,
        uploadedAt: m.created_at
      })) || []
    })) as Course[],
    totalStudents,
    pendingGrading
  };
}

// --- Admin System Stats ---
export async function getAdminDashboardData() {
  const [
    { count: studentCount },
    { count: teacherCount },
    { count: courseCount },
    { data: pendingUsers },
    { data: activeLive },
    { data: attendance },
    { data: submissions },
    { data: courses }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").eq("status", "pending"),
    supabase.from("live_classes").select("*, profiles(name)").eq("status", "live"),
    supabase.from("attendance").select("status"),
    supabase.from("submissions").select("grade, assignments(max_score, course_id)"),
    supabase.from("courses").select("id, code, title, enrollments(count)")
  ]);

  const totalAtt = attendance?.length || 0;
  const presentAtt = attendance?.filter(a => a.status === "present").length || 0;
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

  if (!courses || courses.length === 0) {
    return {
      students: mock.users.filter(u => u.role === "student").length,
      teachers: mock.users.filter(u => u.role === "teacher").length,
      courses: mock.courses.length,
      pending: mock.users.filter(u => u.status === "pending"),
      activeLive: mock.liveClasses.filter(lc => lc.status === "live"),
      attendanceRate: 92,
      attendanceRaw: mock.attendanceRecords,
      submissionsRaw: mock.courses.flatMap(c => c.assignments.flatMap(a => a.submissions)),
      coursesRaw: mock.courses.map(c => ({ id: c.id, code: c.code, title: c.title, enrollments: { count: c.students.length } }))
    };
  }

  return {
    students: studentCount || 0,
    teachers: teacherCount || 0,
    courses: courseCount || 0,
    pending: (pendingUsers || []) as User[],
    activeLive: (activeLive || []).map(lc => ({
      ...lc,
      teacherName: (lc as any).profiles?.name || "Unknown"
    })) as LiveClass[],
    attendanceRate,
    attendanceRaw: attendance || [],
    submissionsRaw: submissions || [],
    coursesRaw: courses || []
  };
}

export async function createProfile(profileData: any) {
  const { registrationNumber, ...restData } = profileData;

  const { data, error } = await supabase
    .from("profiles")
    .insert([{
      ...restData,
      id: profileData.id || crypto.randomUUID(),
      status: profileData.status || 'active',
      registration_number: profileData.registrationNumber
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, status: "active" | "rejected") {
  const { data, error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createCourse(courseData: Partial<Course>) {
  // Demo Mode
  const teacherId = (courseData as any).teacherId || (courseData as any).teacher_id;
  if (teacherId === "t1" || teacherId === "t2") {
    const newCourse = { ...courseData, id: `c-new-${Date.now()}` };
    const existing = JSON.parse(localStorage.getItem('demo-courses') || '[]');
    localStorage.setItem('demo-courses', JSON.stringify([...existing, newCourse]));
    return newCourse;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert([{
      ...courseData,
      teacher_id: teacherId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string) {
  if (id.startsWith('c') && id.length < 5) return; // Mock ID

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// --- Messaging & Chat ---
export async function getConversations(userId: string) {
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  let allMessages = messages || [];
  
  // Merge with Demo Messages
  if (typeof window !== 'undefined') {
    const demoMessages = JSON.parse(localStorage.getItem('demo-messages') || '[]');
    const userDemoMessages = demoMessages.filter((m: any) => m.sender_id === userId || m.receiver_id === userId);
    allMessages = [...allMessages, ...userDemoMessages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  if (allMessages.length === 0) return [];

  const otherIds = Array.from(new Set(allMessages.map(m => 
    m.sender_id === userId ? m.receiver_id : m.sender_id
  )));

  if (otherIds.length === 0) return [];

  const { data: profiles, error: profError } = await supabase
    .from("profiles")
    .select("id, name, role, avatar")
    .in("id", otherIds);

  if (profError || !profiles) {
    console.error("getConversations profiles error:", profError);
    return [];
  }

  const profileMap = new Map(profiles.map(p => [p.id, p]));
  const convMap = new Map();

  allMessages.forEach(msg => {
    const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    const other = profileMap.get(otherId);
    
    if (!other) return;

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        id: otherId,
        other,
        lastMessage: msg.content,
        timestamp: msg.created_at,
        unreadCount: !msg.is_read && msg.receiver_id === userId ? 1 : 0
      });
    } else if (!msg.is_read && msg.receiver_id === userId) {
      const existing = convMap.get(otherId);
      existing.unreadCount++;
    }
  });

  return Array.from(convMap.values());
}

export async function getMessages(userId: string, otherId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`)
    .order("created_at", { ascending: true });

  let allMessages = data || [];

  // Merge with Demo Messages
  if (typeof window !== 'undefined') {
    const demoMessages = JSON.parse(localStorage.getItem('demo-messages') || '[]');
    const relevantDemo = demoMessages.filter((m: any) => 
      (m.sender_id === userId && m.receiver_id === otherId) || 
      (m.sender_id === otherId && m.receiver_id === userId)
    );
    allMessages = [...allMessages, ...relevantDemo].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return allMessages;
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  // Demo Mode
  if (senderId.length < 5 || receiverId.length < 5) {
    const newMessage = {
      id: `msg-new-${Date.now()}`,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('demo-messages') || '[]');
    localStorage.setItem('demo-messages', JSON.stringify([...existing, newMessage]));
    return newMessage;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([{ 
      sender_id: senderId, 
      receiver_id: receiverId, 
      content,
      is_read: false 
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markMessagesAsRead(userId: string, otherId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", otherId)
    .eq("is_read", false);

  if (error) {
    console.error("markMessagesAsRead error:", error);
  }
}


export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map((n) => ({
    ...n,
    createdAt: n.created_at,
  })) as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function getTeacherLiveClasses(teacherId: string) {
  const { data, error } = await supabase
    .from("live_classes")
    .select("*, courses(title)")
    .eq("teacher_id", teacherId)
    .order("scheduled_at", { ascending: true });

  if (error || !data || data.length === 0) {
    let mockClasses = mock.liveClasses.filter(lc => lc.teacherId === teacherId || teacherId === "t1");
    
    // Merge with locally created demo classes
    if (typeof window !== 'undefined') {
      const demoClasses = JSON.parse(localStorage.getItem('demo-live-classes') || '[]');
      const teacherDemoClasses = demoClasses.filter((dc: any) => dc.teacherId === teacherId);
      mockClasses = [...mockClasses, ...teacherDemoClasses];
    }

    // Apply localStorage overrides for demo persistence
    return mockClasses.map(lc => {
      if (typeof window !== 'undefined') {
        const savedStatus = localStorage.getItem(`live-class-status-${lc.id}`);
        if (savedStatus) return { ...lc, status: savedStatus as any };
      }
      return lc;
    }).map(lc => ({
      ...lc,
      courseName: (lc as any).courses?.title || (lc as any).courseName || "Unknown Course"
    })) as LiveClass[];
  }
  return data.map(lc => ({
    ...lc,
    courseName: (lc as any).courses?.title || "Unknown Course"
  })) as LiveClass[];
}

export async function scheduleLiveClass(classData: Partial<LiveClass>) {
  const teacherId = classData.teacherId || (classData as any).teacher_id;
  const courseId = classData.courseId || (classData as any).course_id;

  // Demo Mode Persistence
  if (teacherId === "t1" || teacherId === "t2" || courseId?.startsWith('c')) {
    const newClass = {
      ...classData,
      id: `lc-new-${Date.now()}`,
      courseName: classData.courseName || "General Session",
      status: classData.status || "scheduled"
    };
    const existing = JSON.parse(localStorage.getItem('demo-live-classes') || '[]');
    localStorage.setItem('demo-live-classes', JSON.stringify([...existing, newClass]));
    return newClass;
  }

  const insertData = {
    id: classData.id || crypto.randomUUID(),
    title: classData.title,
    course_id: courseId,
    teacher_id: teacherId,
    scheduled_at: classData.scheduledAt || (classData as any).scheduled_at,
    duration: classData.duration,
    status: classData.status || "scheduled"
  };

  const { data, error } = await supabase
    .from("live_classes")
    .insert([insertData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudentAttendance(studentId: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      courses (title, code),
      marker:profiles!attendance_marked_by_fkey(name)
    `)
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (error) return [];
  return data.map(record => ({
    ...record,
    courseName: (record as any).courses?.title || "Unknown",
    courseCode: (record as any).courses?.code || "",
    markedBy: (record as any).marker?.name || "System"
  }));
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count || 0;
}

export async function uploadMaterial(materialData: Partial<Material>, file?: File) {
  let fileUrl = "";
  const courseId = materialData.courseId || (materialData as any).course_id;
  if (!courseId) throw new Error("Course ID is required.");

  // Demo Mode Persistence
  if (courseId.startsWith('c') && courseId.length < 5) {
    const newMaterial = {
      ...materialData,
      id: `m-new-${Date.now()}`,
      courseId,
      uploadedAt: new Date().toISOString(),
      file_url: "https://example.com/demo-file.pdf"
    };
    const existing = JSON.parse(localStorage.getItem(`demo-materials-${courseId}`) || '[]');
    localStorage.setItem(`demo-materials-${courseId}`, JSON.stringify([...existing, newMaterial]));
    return newMaterial;
  }

  if (file) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${courseId}/${Math.random().toString(36).substring(2, 7)}_${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('materials')
      .getPublicUrl(filePath);
    fileUrl = publicUrl;
  }

  const { data, error } = await supabase
    .from("materials")
    .insert([{
      title: materialData.title,
      type: materialData.type,
      course_id: courseId,
      file_size: (materialData as any).size || "0 MB",
      file_url: fileUrl
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function submitAssignment(submissionData: any) {
  // Demo Mode
  if (submissionData.studentId?.startsWith('u') && submissionData.studentId.length < 5) {
    const newSubmission = { ...submissionData, id: `s-new-${Date.now()}`, status: "submitted", submitted_at: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('demo-submissions') || '[]');
    localStorage.setItem('demo-submissions', JSON.stringify([...existing, newSubmission]));
    return newSubmission;
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert([{
      student_id: submissionData.studentId,
      assignment_id: submissionData.assignmentId,
      content: submissionData.content || "",
      file_url: submissionData.fileUrl || null,
      status: "submitted",
      submitted_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudentSubmissions(studentId: string, assignmentId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("student_id", studentId)
    .eq("assignment_id", assignmentId);
  
  if (error) return [];
  return data;
}

export async function getPendingSubmissions(teacherId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      *,
      assignment:assignments (title, max_score, course_id, courses (title)),
      student:profiles (name, registration_number)
    `)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });

  if (error) return [];
  return data.map(s => ({
    ...s,
    assignmentTitle: (s as any).assignment?.title,
    courseTitle: (s as any).assignment?.courses?.title,
    studentName: (s as any).student?.name,
    registrationNumber: (s as any).student?.registration_number,
    maxScore: (s as any).assignment?.max_score
  }));
}

export async function submitGrade(submissionId: string, grade: number, feedback: string) {
  // Demo Mode
  if (submissionId.startsWith('s-new') || submissionId.length < 5) {
    const existing = JSON.parse(localStorage.getItem('demo-submissions') || '[]');
    const updated = existing.map((s: any) => s.id === submissionId ? { ...s, grade, feedback, status: "graded" } : s);
    localStorage.setItem('demo-submissions', JSON.stringify(updated));
    return;
  }

  const { error } = await supabase
    .from("submissions")
    .update({ grade, feedback, status: "graded" })
    .eq("id", submissionId);
  if (error) throw error;
}

export async function submitAttendance(records: any[]) {
  // Demo Mode
  if (records.length > 0 && records[0].student_id?.startsWith('u') && records[0].student_id.length < 5) {
    const existing = JSON.parse(localStorage.getItem('demo-attendance') || '[]');
    localStorage.setItem('demo-attendance', JSON.stringify([...existing, ...records]));
    return;
  }

  const { error } = await supabase.from("attendance").insert(records);
  if (error) throw error;
}

export async function getCourseStudents(courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`student_id, profiles:student_id (id, name, email, avatar, registration_number)`)
    .eq("course_id", courseId);

  if (error) return [];
  return data.map((e: any) => e.profiles);
}

export async function updateLiveClassStatus(classId: string, status: "live" | "ended") {
  // Demo Mode Persistence
  if (typeof window !== 'undefined' && (classId.startsWith('lc') || classId.length < 10)) {
    localStorage.setItem(`live-class-status-${classId}`, status);
    return; // Don't even try Supabase for mock IDs to avoid errors
  }

  const { error } = await supabase.from("live_classes").update({ status }).eq("id", classId);
  
  // If Supabase update fails but it's a demo/mock ID that doesn't exist in DB, 
  // we still want to persist it locally for the session.
  if (error) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`live-class-status-${classId}`, status);
      return; 
    }
    throw error;
  }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(u => ({
    ...u,
    registrationNumber: u.registration_number,
    joinedAt: u.created_at
  })) as User[];
}

export async function getLiveClassById(id: string) {
  const { data, error } = await supabase
    .from("live_classes")
    .select(`*, courses (title, teacher_id, profiles!courses_teacher_id_fkey (name))`)
    .eq("id", id)
    .single();

  if (error || !data) {
    const mockClass = mock.liveClasses.find(lc => lc.id === id);
    if (mockClass) {
      if (typeof window !== 'undefined') {
        const savedStatus = localStorage.getItem(`live-class-status-${id}`);
        if (savedStatus) return { ...mockClass, status: savedStatus as any };
      }
      return mockClass;
    }
    return null;
  }
  return {
    ...data,
    courseName: data.courses?.title,
    teacherId: data.courses?.teacher_id,
    teacherName: data.courses?.profiles?.name
  } as LiveClass;
}

export async function publishGlobalNotification(title: string, message: string, type: "grade" | "material" | "class" | "assignment" | "system" | "attendance") {
  const { data: students } = await supabase.from("profiles").select("id").eq("role", "student");
  if (!students) return;
  const notifs = students.map(s => ({
    user_id: s.id,
    title,
    message,
    type,
    is_read: false
  }));
  await supabase.from("notifications").insert(notifs);
}

export async function submitAssignmentWithFile(submissionData: any, file?: File) {
  let fileUrl = "";
  if (file) {
    const filePath = `submissions/${submissionData.studentId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("submissions").upload(filePath, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("submissions").getPublicUrl(filePath);
      fileUrl = publicUrl;
    }
  }
  return submitAssignment({ ...submissionData, fileUrl });
}
