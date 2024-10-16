import { useState, useEffect, useMemo, memo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RightSidebar } from '../components/Shared/RightSidebar';
import { SidebarComponent } from '../components/Shared/Sidebar';
import { Dashboard } from '../pages/Dashboard';
import { Courses } from './Courses';
import { Masters } from './Masters';
import { PhD } from './PhD';
import { Honours } from './Honours';
import { Research } from './Research';
import { Course } from './Course';
import { Assignments } from './Assignments';
import { ResearchCourse } from './ResearchCrs';
import { Inbox } from './Inbox';
import { Milestones } from './Milestones';
import { Settings } from './Settings';
import { Tasks } from './Tasks';
import { TopicContent } from './SyllabusPage';
import { LogoLoader } from '../components/LogoLoader';
import { Review } from './Reviews';
import { HonoursCrs } from './HonoursCrs';
import { motion } from 'framer-motion';

// Admin-specific pages
import { AdminDashboard } from './AdminDashboard';
import { AdminSettings } from './AdminSettings';
import { AdminReports } from './AdminReports';

// Memoize the Sidebar and RightSidebar components to prevent re-renders
const MemoizedSidebarComponent = memo(SidebarComponent);
const MemoizedRightSidebar = memo(RightSidebar);

export const PageRoutes = () => {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null); // This could be retrieved from context, API, etc.
  const location = useLocation();

  // Example: Fetch user role (could be from localStorage, API, etc.)
  useEffect(() => {
    const fetchUserRole = () => {
      // Assuming you store user role in localStorage or get it from an API
      const role = localStorage.getItem('userRole') || 'student'; // Default to 'student'
      setUserRole(role);
    };
    
    fetchUserRole();
  }, []);

  // Memoize the routes based on user role
  const routes = useMemo(() => {
    if (userRole === 'admin') {
      return (
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} /> {/* Redirect all undefined routes to Admin Dashboard */}
        </Routes>
      );
    } else {
      return (
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/course/:courseId" element={<Course />} />
          <Route path="/honours/:courseId/assignments/:assignmentId" element={<Assignments />} />
          <Route path="/courses/course/:courseId/topic/:topicId" element={<TopicContent />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/:researchId" element={<ResearchCourse />} />
          <Route path="/honours" element={<Honours />} />
          <Route path="/honours/:researchId" element={<HonoursCrs />} />
          <Route path="/phd" element={<PhD />} />
          <Route path="/phd/:studentID" element={<ResearchCourse />} />
          <Route path="/phd/:courseId/assignments/:assignmentId" element={<Assignments />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/masters/:studentID" element={<ResearchCourse />} />
          <Route path="/masters/:courseId/assignments/:assignmentId" element={<Assignments />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review-submissions" element={<Review />} />
          <Route path="*" element={<Navigate to="/dashboard" />} /> {/* Redirect all undefined routes to Dashboard */}
        </Routes>
      );
    }
  }, [userRole]);

  // Effect to manage loading based on location change
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    handleStart(); // Start loading

    const timer = setTimeout(() => {
      handleComplete(); // Stop loading after a short delay
    }, 3000); // Adjust the duration to match your actual loading times

    return () => clearTimeout(timer); // Cleanup timer
  }, [location]); // Re-run effect only when location changes

  return (
    <div className="flex">
      <MemoizedSidebarComponent />
      <main className="flex-1 relative">
        {loading ? (
          <LogoLoader />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {routes}
          </motion.div>
        )}
      </main>
      <MemoizedRightSidebar />
    </div>
  );
};
