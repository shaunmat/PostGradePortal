import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Import Link
import Logo from '../../assets/images/UJ Logo.png';
import UserLogo from '../../assets/images/Avatar.png';
import {
  HiLogout,
  HiFlag,
  HiChartPie,
  HiAcademicCap,
  HiMail,
  HiUserGroup,
  HiBookOpen,
  HiViewBoards,
  HiCollection,
} from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../backend/authcontext';
import { auth } from '../../backend/config';
import { useTheme } from '../../context/ThemeContext';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Ensure Firestore functions are imported
import { db } from '../../backend/config'; // Adjust path as needed

export const SidebarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [userID, setUserID] = useState('');
  const [ProfilePicture, setProfilePicture] = useState('');
  const { UserData, UserRole, Loading } = useAuth();
  const [UserLevel, setUserLevel] = useState('');
  const { theme } = useTheme();
  const [supervisedCourses, setSupervisedCourses] = useState({
    honours: false,
    masters: false,
    phd: false,
  });

  // Check cache on component mount for user data
  useEffect(() => {
    const cachedUserData = localStorage.getItem('userData');
    if (cachedUserData) {
      const parsedData = JSON.parse(cachedUserData);
      setUserName(parsedData.Name);
      setUserSurname(parsedData.Surname);
      setProfilePicture(parsedData.ProfilePicture || UserLogo);
      setUserLevel(UserRole === 'Student' ? UserData.StudentType : UserRole);
      setUserID(parsedData.ID)
    } else if (!Loading && UserData) {
      setUserName(UserData.Name);
      setUserSurname(UserData.Surname);
      setProfilePicture(UserData.ProfilePicture || UserLogo);
      setUserID(UserData.ID)
      localStorage.setItem('userData', JSON.stringify(UserData)); // Cache user data
    }
  }, [Loading, UserData, UserRole]);

  // Check for cached supervisor modules
  useEffect(() => {
    const cachedModules = localStorage.getItem('supervisorModules');
    const cacheTime = localStorage.getItem('supervisorModulesCacheTime');
    const isCacheValid = cacheTime && (Date.now() - cacheTime) < (60 * 60 * 1000); // 1-hour cache expiration

    if (UserRole === 'Supervisor' && UserData && UserData.CourseID) {
      if (cachedModules && isCacheValid) {
        setSupervisedCourses(JSON.parse(cachedModules));
      } else {
        fetchSupervisorModules(UserData.CourseID);
      }
    }
  }, [UserRole, UserData]);

  // Fetch supervisor modules and cache them
  const fetchSupervisorModules = async (courseIDs) => {
    try {
      const honours = [];
      const masters = [];
      const phd = [];

      for (const courseID of courseIDs) {
        const moduleRef = collection(db, 'Module');
        const q = query(moduleRef, where('ModuleID', '==', courseID));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const moduleData = doc.data();
          if (moduleData.ModuleType === 'Honours') {
            honours.push(moduleData);
          } else if (moduleData.ModuleType === 'Masters') {
            masters.push(moduleData);
          } else if (moduleData.ModuleType === 'PhD') {
            phd.push(moduleData);
          }
        });
      }

      const fetchedCourses = {
        honours: honours.length > 0,
        masters: masters.length > 0,
        phd: phd.length > 0,
      };

      setSupervisedCourses(fetchedCourses);
      localStorage.setItem('supervisorModules', JSON.stringify(fetchedCourses)); // Cache modules
      localStorage.setItem('supervisorModulesCacheTime', Date.now()); // Set cache time
    } catch (error) {
      console.error('Error fetching supervisor modules:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userData'); // Clear cached data on logout
      localStorage.removeItem('supervisorModules'); // Clear supervisor modules cache on logout
      localStorage.removeItem('supervisorModulesCacheTime'); // Clear cache time
      navigate('/login');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const sidebarLinks = {
    Student: [
      { path: '/dashboard', label: 'Dashboard', icon: <HiChartPie className="w-6 h-6" /> },
      { path: '/research', label: 'Research', icon: <HiAcademicCap className="w-6 h-6" /> },
      { path: '/tasks', label: 'Tasks', icon: <HiViewBoards className="w-6 h-6" /> },
      { path: '/inbox', label: 'Inbox', icon: <HiMail className="w-6 h-6" /> },
      { path: '/milestones', label: 'Milestones', icon: <HiFlag className="w-6 h-6" /> },
      { path: '/settings', label: 'Settings', icon: <HiUserGroup className="w-6 h-6" /> },
      { path: '/logout', label: 'Log Out', icon: <HiLogout className="w-6 h-6" />, action: handleLogout },
    ],
    Supervisor: [
      { path: '/dashboard', label: 'Dashboard', icon: <HiChartPie className="w-6 h-6" /> },
      supervisedCourses.honours && { path: '/honours', label: 'Honours', icon: <HiAcademicCap className="w-6 h-6" /> },
      supervisedCourses.masters && { path: '/masters', label: 'Masters', icon: <HiBookOpen className="w-6 h-6" /> },
      supervisedCourses.phd && { path: '/phd', label: 'PhD', icon: <HiCollection className="w-6 h-6" /> },
      { path: '/tasks', label: 'Tasks', icon: <HiViewBoards className="w-6 h-6" /> },
      { path: "/students", label: "Students", icon: <HiAcademicCap className="w-6 h-6" /> },
      { path: '/inbox', label: 'Inbox', icon: <HiMail className="w-6 h-6" /> },
      { path: '/milestones', label: 'Milestones', icon: <HiFlag className="w-6 h-6" /> },
      { path: '/settings', label: 'Settings', icon: <HiUserGroup className="w-6 h-6" /> },
      { path: '/logout', label: 'Log Out', icon: <HiLogout className="w-6 h-6" />, action: handleLogout },
    ].filter(Boolean), // Filter out any false values
    Examiner: [
      { path: '/dashboard', label: 'Dashboard', icon: <HiChartPie className="w-6 h-6" /> },
      { path: '/review-submissions', label: 'Reviews', icon: <HiFlag className="w-6 h-6" /> },
      { path: '/submissions', label: 'Submissions', icon: <HiViewBoards className="w-6 h-6" /> },
      { path: '/inbox', label: 'Inbox', icon: <HiMail className="w-6 h-6" /> },
      { path: '/settings', label: 'Settings', icon: <HiUserGroup className="w-6 h-6" /> },
      { path: '/logout', label: 'Log Out', icon: <HiLogout className="w-6 h-6" />, action: handleLogout },
    ],
  };

  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="fixed top-0 left-0 z-40 w-72 h-screen transition-transform -translate-x-full sm:translate-x-0 sidebar bg-[url('../../src/assets/images/student_side_dash.jpg')]"
      aria-label="Sidebar"
    >
      <div className="h-full px-4 py-4 overflow-y-auto bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('../../src/assets/images/student_side_dash_img.jpg')] bg-cover bg-center bg-no-repeat dark:bg-gray-800">
        {/* Logo */}
        <div className="flex items-center justify-center mb-3">
          <Link to="/" className="flex items-center p-2 group">
            <img src={Logo} className="w-auto h-25 me-3 sm:h-15" alt="UJ Logo" />
          </Link>
        </div>

        <hr className="border-t-2 mb-2 border-gray-700 dark:border-gray-600" />

        {/* Sidebar Navigation */}
        <ul className="space-y-2 font-bold text-lg">
          {sidebarLinks[UserRole].map(({ path, label, icon, action }) => (
            <li key={path}>
              <Link
                to={path}
                onClick={action ? (e) => { e.preventDefault(); action(); } : undefined}
                className={`flex items-center p-2 rounded-lg group ${
                  location.pathname === path
                    ? 'bg-gray-700 dark:bg-gray-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                {icon}
                <span className="ms-3">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User Profile Card */}
        <div className="absolute bottom-6 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3">
          <div className="flex items-center space-x-3">
            <img
              src={ProfilePicture}
              className="w-14 h-14 rounded-full"
              alt="avatar"
            />
            <div className='text-sm flex-1 overflow-hidden'>
              <p className="font-extrabold text-md text-gray-900 dark:text-white">{userName} {userSurname}</p>
              <p className="font-semibold text-gray-700 dark:text-Black">{UserLevel}</p>
              <p className="font-semibold text-gray-600 dark:text-gray-300">{userID}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
