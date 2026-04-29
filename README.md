# EduRa: Advanced Learning Management System (LMS)

![EduRa Banner](https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop)

EduRa is a modern, high-performance Learning Management System built with **Next.js 14**, **Supabase**, and **LiveKit**. It features a stunning glassmorphism design and provides a comprehensive suite of tools for students, teachers, and administrators.

## 🚀 Features

### For Students
*   **Interactive Dashboards**: Real-time view of GPA, course progress, and upcoming deadlines.
*   **Course Materials**: Access to video lectures, reading materials, and resources.
*   **Seamless Submissions**: Easy-to-use assignment portal with version tracking.
*   **Virtual Classrooms**: Join live lectures with integrated video and chat.

### For Teachers
*   **Class Management**: Create and manage courses, schedules, and attendance.
*   **Grading Suite**: Efficient grading interface with rich feedback capabilities.
*   **Live Hosting**: Host virtual classes using high-concurrency streaming infrastructure.
*   **Communication**: Direct messaging and notification broadcasting to students.

### For Administrators
*   **User Management**: Role-based access control and user auditing.
*   **Platform Analytics**: System-wide insights into engagement and performance.
*   **Notifications**: Broadcast announcements to the entire student body or staff.

## 🛠️ Technology Stack

*   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Backend & Auth**: [Supabase](https://supabase.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Real-time Video**: [LiveKit](https://livekit.io/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
*   Node.js 18.x or later
*   NPM or Yarn
*   A Supabase project
*   A LiveKit project (for virtual classes)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/edura-lms.git
    cd edura-lms
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root directory and add your credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    LIVEKIT_API_KEY=your_livekit_key
    LIVEKIT_API_SECRET=your_livekit_secret
    NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 Documentation
*   [System Documentation](SYSTEM_DOCUMENTATION.md)
*   [Project Roadmap](PROJECT_ROADMAP.md)

---
*Built with ❤️ by the EduRa Engineering Team.*
