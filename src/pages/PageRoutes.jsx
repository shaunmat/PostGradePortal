import { useState, useEffect, useMemo, memo, useCallback } from 'react';
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
import { AdminDashboard } from '../pages/AdminPages/AdminDashboard';
import { AdminSettings } from '../pages/AdminPages/AdminSettings';
import { AdminAnalytics } from './AdminPages/AdminAnalytics';
import { MastersCrs } from './MastersCrs';
import { Students } from './Students';
import { StudentsData } from './StudentData';
import { PhDCrs } from './PhDCrs';
import { FinalSubmissions } from "./FinalSubmissions";
import { Details } from "./Details";

// Memoize the Sidebar and RightSidebar components to prevent re-renders
const MemoizedSidebarComponent = memo(SidebarComponent);
const MemoizedRightSidebar = memo(RightSidebar);

export const PageRoutes = () => {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('Student'); // Default to 'Student'
  const location = useLocation();

  // Fetch user role (could be from localStorage, API, etc.)
  useEffect(() => {
    const fetchUserRole = () => {
      const role = localStorage.getItem('userRole') || 'Student'; // Default to 'Student'
      setUserRole(role);
      console.log("This is the current role right now:", role);
    };

    fetchUserRole();
    console.log("This is the current role right now:", userRole);
  }, []);

  // Memoize the routes based on userRole
  const routes = useMemo(() => {
    // if (userRole === 'Admin') {
    //   return (
    //     <Routes>
    //       <Route path="/admin/dashboard" element={<AdminDashboard />} />
    //       <Route path="/admin/settings" element={<AdminSettings />} />
    //       {/* <Route path="/admin/reports" element={<AdminReports />} /> */}
    //       <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} /> {/* Redirect all undefined routes to Admin Dashboard */}
    //     </Routes>
    //   );
    // } else {
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
          <Route path="/phd/:researchId" element={<PhDCrs />} />
          <Route path="/phd/:courseId/assignments/:assignmentId" element={<Assignments />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/masters/:researchId" element={<MastersCrs />} />
          <Route path="/masters/:courseId/assignments/:assignmentId" element={<Assignments />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:StudentID" element={<StudentsData />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/review-submissions" element={<Review />} />
          <Route path='/analytics' element={<AdminAnalytics />} />
          <Route path="/finalSubmissions" element={< FinalSubmissions/>} />
          <Route path="/Details/:UserID" element={< Details/>} />
          {/* <Route path="*" element={<Navigate to="/dashboard" />} /> Redirect all undefined routes to Dashboard */}

        </Routes>
      );
  }, [userRole, setUserRole]);

  const handleStart = useCallback(() => setLoading(true), []);
  const handleComplete = useCallback(() => setLoading(false), []);

  // Effect to manage loading based on location change
  useEffect(() => {
    handleStart(); // Start loading

    const timer = setTimeout(() => {
      handleComplete(); // Stop loading after a short delay
    }, 3000); // Adjust the duration to match your actual loading times

    return () => clearTimeout(timer); // Cleanup timer
  }, [location, handleStart, handleComplete]); // Re-run effect only when location changes

  return (
    <div className="flex">
      <MemoizedSidebarComponent />
      <main className="flex-1">
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