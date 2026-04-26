-- LMS SEED SCRIPT (Realistic Demo Data + Schema Fix)
-- Run this in the Supabase SQL Editor

-- 1. REPAIR SCHEMA (Add missing columns to courses if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='semester') THEN
        ALTER TABLE public.courses ADD COLUMN semester TEXT DEFAULT 'Spring 2026';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='credits') THEN
        ALTER TABLE public.courses ADD COLUMN credits INTEGER DEFAULT 3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='color') THEN
        ALTER TABLE public.courses ADD COLUMN color TEXT DEFAULT 'hsl(270, 80%, 70%)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='content') THEN
        ALTER TABLE public.submissions ADD COLUMN content TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='file_url') THEN
        ALTER TABLE public.submissions ADD COLUMN file_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='submissions' AND column_name='file_name') THEN
        ALTER TABLE public.submissions ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- 2. DISABLE FOREIGN KEY TO AUTH AND RLS (For Demo Purposes)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;

-- 3. DEFINE IDS & INSERT DATA
DO $$ 
DECLARE 
    admin_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    teacher_thompson_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    teacher_carter_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    student_alice_id UUID := '11111111-1111-1111-1111-111111111111';
    student_bob_id UUID := '22222222-2222-2222-2222-222222222222';
    course_ds_id UUID := 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';
    course_math_id UUID := 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2';
    assign_1_id UUID := 'a1a1a1a1-1111-1111-1111-111111111111';
BEGIN

-- CLEANUP OLD DEMO DATA (Keep real user data if any)
DELETE FROM public.messages WHERE sender_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('TCH-8821', 'TCH-9942')) OR receiver_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('4332351', '4332352'));
DELETE FROM public.submissions WHERE student_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('4332351', '4332352'));
DELETE FROM public.assignments WHERE course_id IN (SELECT id FROM public.courses WHERE teacher_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('TCH-8821', 'TCH-9942')));
DELETE FROM public.live_classes WHERE teacher_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('TCH-8821', 'TCH-9942'));
DELETE FROM public.enrollments WHERE student_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('4332351', '4332352'));
DELETE FROM public.courses WHERE teacher_id IN (SELECT id FROM public.profiles WHERE registration_number IN ('TCH-8821', 'TCH-9942'));
DELETE FROM public.profiles WHERE registration_number IN ('4332351', '4332352', 'TCH-8821', 'TCH-9942');

-- INSERT PROFILES
INSERT INTO public.profiles (id, email, name, role, registration_number, department, status, avatar)
VALUES 
(teacher_thompson_id, 'thompson@university.edu', 'Dr. Sarah Thompson', 'teacher', 'TCH-8821', 'Computer Science', 'active', 'ST'),
(teacher_carter_id, 'carter@university.edu', 'Prof. James Carter', 'teacher', 'TCH-9942', 'Mathematics', 'active', 'JC'),
(student_alice_id, 'alice@university.edu', 'Alice Johnson', 'student', '4332351', 'Computer Science', 'active', 'AJ'),
(student_bob_id, 'bob@university.edu', 'Bob Smith', 'student', '4332352', 'Computer Science', 'active', 'BS');

-- INSERT COURSES
INSERT INTO public.courses (id, title, code, description, teacher_id, color, semester, credits)
VALUES 
(course_ds_id, 'Data Structures & Algorithms', 'CS-433', 'Advanced data structures and algorithmic analysis.', teacher_thompson_id, 'hsl(234, 89%, 58%)', 'Spring 2026', 4),
(course_math_id, 'Linear Algebra', 'MATH-301', 'Study of vectors, matrices, and linear transformations.', teacher_carter_id, 'hsl(160, 60%, 45%)', 'Spring 2026', 3);

-- INSERT ENROLLMENTS
INSERT INTO public.enrollments (course_id, student_id)
VALUES 
(course_ds_id, student_alice_id),
(course_math_id, student_alice_id),
(course_ds_id, student_bob_id);

-- INSERT LIVE CLASSES
INSERT INTO public.live_classes (id, course_id, title, scheduled_at, duration, status, teacher_id)
VALUES 
(gen_random_uuid(), course_ds_id, 'Graph Algorithms Deep Dive', now(), 90, 'live', teacher_thompson_id),
(gen_random_uuid(), course_math_id, 'Eigenvectors & Eigenvalues', now() + interval '1 day', 60, 'scheduled', teacher_carter_id);

-- INSERT ASSIGNMENTS
INSERT INTO public.assignments (id, course_id, title, description, due_date, max_score)
VALUES 
(assign_1_id, course_ds_id, 'Assignment 1: Linked Lists', 'Implement a doubly linked list.', now() + interval '7 days', 100);

-- INSERT SUBMISSIONS
INSERT INTO public.submissions (id, student_id, assignment_id, submitted_at, grade, feedback, status)
VALUES 
(gen_random_uuid(), student_alice_id, assign_1_id, now() - interval '1 day', 95, 'Excellent work!', 'graded');

-- INSERT MESSAGES
INSERT INTO public.messages (id, sender_id, receiver_id, content, is_read, created_at)
VALUES 
(gen_random_uuid(), teacher_thompson_id, student_alice_id, 'Hi Alice, great job on the assignment!', true, now() - interval '2 hours');

END $$;
