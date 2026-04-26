-- LMS SEED SCRIPT (Realistic Demo Data + Schema Fix)
-- Run this in the Supabase SQL Editor

-- 1. REPAIR STORAGE & SCHEMA
-- Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true), ('submissions', 'submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Relax storage policies for demo purposes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (true) WITH CHECK (true);

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

    -- Ensure messages table exists (Relaxed constraints for demo)
    DROP TABLE IF EXISTS public.messages CASCADE;
    CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
END $$;

-- Enable Realtime for messages (Outside main block)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = 'public' 
            AND tablename = 'messages'
        ) THEN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Handle gracefully
END $$;

-- 2. DISABLE FOREIGN KEY TO AUTH AND RLS (For Demo Purposes)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;

-- 3. DEFINE IDS & INSERT DATA
DO $$ 
DECLARE 
    admin_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    teacher_thompson_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    teacher_carter_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    
    -- Student IDs (Exactly 11)
    s1 UUID := '11111111-1111-1111-1111-111111111111';
    s2 UUID := '22222222-2222-2222-2222-222222222222';
    s3 UUID := '33333333-3333-3333-3333-333333333333';
    s4 UUID := '44444444-4444-4444-4444-444444444444';
    s5 UUID := '55555555-5555-5555-5555-555555555555';
    s6 UUID := '66666666-6666-6666-6666-666666666666';
    s7 UUID := '77777777-7777-7777-7777-777777777777';
    s8 UUID := '88888888-8888-8888-8888-888888888888';
    s9 UUID := '99999999-9999-9999-9999-999999999999';
    s10 UUID := '10101010-1010-1010-1010-101010101010';
    s11 UUID := '11111111-0000-0000-0000-111111111111';

    course_ds_id UUID := 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1';
    course_math_id UUID := 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2';
    course_physics_id UUID := 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
    
    assign_1_id UUID := 'a1a1a1a1-1111-1111-1111-111111111111';
BEGIN

-- CLEANUP
DELETE FROM public.messages;
DELETE FROM public.attendance;
DELETE FROM public.submissions;
DELETE FROM public.assignments;
DELETE FROM public.live_classes;
DELETE FROM public.enrollments;
DELETE FROM public.courses;
DELETE FROM public.profiles;

-- INSERT PROFILES
INSERT INTO public.profiles (id, email, name, role, registration_number, department, status, avatar)
VALUES 
(admin_id, 'admin@edura.edu', 'Admin User', 'admin', 'ADM-001', 'Administration', 'active', 'AD'),
(teacher_thompson_id, 'thompson@university.edu', 'Dr. Sarah Thompson', 'teacher', 'TCH-8821', 'Computer Science', 'active', 'ST'),
(teacher_carter_id, 'carter@university.edu', 'Prof. James Carter', 'teacher', 'TCH-9942', 'Mathematics', 'active', 'JC'),
-- 11 Students (Standardized from Screenshot)
(s1, 'alice@university.edu', 'Alice Johnson', 'student', '4332351', 'CS', 'active', 'AJ'),
(s2, 'bob@university.edu', 'Bob Smith', 'student', '4332352', 'CS', 'active', 'BS'),
(s3, 's4504312@lsbu.ac.uk', 'Veer Patel', 'student', 'STU-2026-005', 'CS', 'active', 'VP'),
(s4, 's4332351@lsbu.ac.uk', 'Het Pandya', 'student', 'STU-2026-009', 'CS', 'active', 'HP'),
(s5, 'trushipatel5@gmail.com', 'Trushi Kirankumar Patel', 'student', 'STU-2026-007', 'CS', 'active', 'TP'),
(s6, 'david.miller@edura.edu', 'David Miller', 'student', 'STD-006', 'CS', 'active', 'DM'),
(s7, 'eve.wilson@edura.edu', 'Eve Wilson', 'student', 'STD-007', 'CS', 'active', 'EW'),
(s8, 'grace.taylor@edura.edu', 'Grace Taylor', 'student', 'STD-008', 'CS', 'active', 'GT'),
(s9, 'henry.anderson@edura.edu', 'Henry Anderson', 'student', 'STD-009', 'CS', 'active', 'HA'),
(s10, 'isabel.thomas@edura.edu', 'Isabel Thomas', 'student', 'STD-010', 'CS', 'active', 'IT'),
(s11, 'jack.jackson@edura.edu', 'Jack Jackson', 'student', 'STD-011', 'CS', 'active', 'JJ');

-- INSERT COURSES
INSERT INTO public.courses (id, title, code, description, teacher_id, color, semester, credits)
VALUES 
(course_ds_id, 'Data Structures & Algorithms', 'CS-433', 'Fundamental algorithms and complex data structures.', teacher_thompson_id, 'hsl(234, 89%, 58%)', 'Spring 2026', 4),
(course_math_id, 'Linear Algebra', 'MATH-301', 'Matrices and vector spaces analysis.', teacher_carter_id, 'hsl(160, 60%, 45%)', 'Spring 2026', 3),
(course_physics_id, 'Quantum Physics', 'PHYS-202', 'Introduction to quantum mechanics and relativity.', teacher_carter_id, 'hsl(280, 70%, 60%)', 'Spring 2026', 4);

-- INITIAL ENROLLMENTS
INSERT INTO public.enrollments (course_id, student_id)
VALUES 
(course_ds_id, s1), (course_math_id, s1), (course_physics_id, s1),
(course_ds_id, s2), (course_ds_id, s3),
(course_ds_id, s4), (course_math_id, s4),
(course_ds_id, s5), (course_math_id, s5);

-- LIVE CLASSES
INSERT INTO public.live_classes (id, course_id, title, scheduled_at, duration, status, teacher_id)
VALUES 
(gen_random_uuid(), course_ds_id, 'Graph Algorithms Workshop', now(), 90, 'live', teacher_thompson_id),
(gen_random_uuid(), course_math_id, 'Eigenvalues Lecture', now() + interval '1 day', 60, 'scheduled', teacher_carter_id);

-- ASSIGNMENTS
INSERT INTO public.assignments (id, course_id, title, description, due_date, max_score)
VALUES 
(assign_1_id, course_ds_id, 'Assignment 1: Trees', 'Implement a balanced AVL tree.', now() + interval '5 days', 100),
(gen_random_uuid(), course_ds_id, 'Assignment 2: Graphs', 'Dijkstra algorithm implementation.', now() + interval '12 days', 100);

-- SUBMISSIONS
INSERT INTO public.submissions (id, student_id, assignment_id, submitted_at, grade, feedback, status)
VALUES 
(gen_random_uuid(), s1, assign_1_id, now() - interval '1 day', 92, 'Solid implementation.', 'graded'),
(gen_random_uuid(), s4, assign_1_id, now() - interval '1 day', 95, 'Excellent trees.', 'graded'),
(gen_random_uuid(), s5, assign_1_id, now() - interval '1 day', 98, 'Perfect logic.', 'graded');

-- ATTENDANCE
INSERT INTO public.attendance (student_id, course_id, date, status, marked_by)
VALUES 
(s1, course_ds_id, now()::date, 'present', admin_id),
(s2, course_ds_id, now()::date, 'present', admin_id),
(s4, course_ds_id, now()::date, 'present', teacher_thompson_id),
(s5, course_ds_id, now()::date, 'present', teacher_thompson_id),
(s4, course_math_id, now()::date, 'present', admin_id),
(s5, course_math_id, now()::date, 'late', teacher_thompson_id);

-- MESSAGES
INSERT INTO public.messages (id, sender_id, receiver_id, content, is_read, created_at)
VALUES 
(gen_random_uuid(), teacher_thompson_id, s1, 'Welcome to the course, Alice!', true, now() - interval '1 hour');

END $$;
