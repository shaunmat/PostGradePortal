import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Modal } from "../components/Modal";
import { motion } from "framer-motion";
import avatar from "../assets/images/Avatar.png";
import { auth, db } from "../backend/config"; // Import your firebase config
import { getDocs, query, collection, where } from "firebase/firestore";
import { useAuth } from "../backend/authcontext";
// import Dropdown from 'react-bootstrap/Dropdown';
// import DropdownButton from 'react-bootstrap/DropdownButton';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const Inbox = () => {
    const { CurrentUser } = useAuth();
    const [studentDetails, setStudentDetails] = useState([]);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [supervisorDetails, setSupervisorDetails] = useState([]);
    const [examinerDetails,setExaminerDetails]=useState([]);
    const [adminDetails,setAdminDetails]=useState([]);
    const [SupervisorID, setSupervisorID] = useState(null);
    const [StudentID, setStudentID] = useState(null);
    const [AdminID,setAdminID]=useState(null);
    const [ExaminerID,setExaminerID]=useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedAdmin,setSelectedAdmin]=useState(null);
    const [selectedExaminer,setSelectedExaminer]=useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseOptions, setCourseOptions] = useState([]);
    const [role, setRole] = useState(null);
    const [filterCourseID, setFilterCourseID] = useState(null);
    const [selectedStudentType, setSelectedStudentType] = useState(null);
    const [chatId, setChatId] = useState(null);
    
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userId = user.email.substring(0, 9);
                console.log("Here is the userId", userId)
                try {
                    const supervisorDoc = await getDocs(query(collection(db, 'Supervisor'), where('ID', '==', Math.floor(userId))));
                    console.log("Supervisor query executed, document snapshot:", supervisorDoc);
                    if (!supervisorDoc.empty) {
                        setRole('Supervisor');
                        setSupervisorID(userId);
                        console.log("Its supervisors not inbox empty")
                        console.log("Role This is the role in the if statement ", role);

                    } else {
                        const studentDoc = await getDocs(query(collection(db, 'Student'), where('ID', '==', Math.floor(userId))));
                        console.log("Student query executed, document snapshot:", studentDoc);
                        if (!studentDoc.empty) {
                            setRole('Student');
                            setStudentID(userId);
                            console.log("The student inbox is not empty")
                            console.log("Role This is the role in the if statement ", role);
                            
                        } else {
                            const adminDoc = await getDocs(query(collection(db, 'Admin'), where('ID', '==', Math.floor(userId))));
                            console.log("Admin query executed, document snapshot:", adminDoc);
                            if (!adminDoc.empty) {
                                setRole('Admin');
                                setAdminID(userId);
                                console.log("The admin inbox is not empty")
                                console.log("Role This is the role in the if statement ", role);
                                
                            }else {
                            const examinerDoc = await getDocs(query(collection(db, 'Examiner'), where('ID', '==', Math.floor(userId))));
                            console.log("Admin query executed, document snapshot:", examinerDoc);
                            if(!examinerDoc.empty){
                                setRole('Examiner');
                                setExaminerID(userId);
                                console.log("The examiner inbox is not empty")
                                console.log("Role This is the role in the if statement ", role);
                                
                            }
                                //console.log("No matching records found in Supervisor, Student, or Admin collections");
                            }
                        }
                        console.log("Role set to", role);
                    }
                    
                    
                }
                catch (error) {
                    console.error("Error querying Firestore:", error);
                }
            } else {
                setSupervisorID(null);
                setStudentID(null);
                setAdminID(null);
                setExaminerID(null)
                setRole(null);
                console.log("No user is logged in");
                
            }
            
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        const fetchDetails = async () => {
            const studentdetsArray = [];
            const supervisorsArray = [];
            const examinerArray= [];
            const adminArray=[];
            const courseIdArray = [];
            try {
                let q;
                if (role === 'Supervisor') {
                    q = query(collection(db, 'Student'), where('SupervisorID', 'array-contains', Math.floor(SupervisorID)));
                    try {
                        const querySnapshot = await getDocs(q);
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            studentdetsArray.push({
                                ProfilePicture: data.ProfilePicture || avatar,
                                StudentID: data.ID,
                                StudentName: data.Name,
                                StudentSurname: data.Surname,
                                lastInteraction: "Just now",
                                StudentType: data.StudentType
                            });
                            courseIdArray.push({
                                CourseID: data.StudentType,
                                CourseName: data.CourseName
                            });
                        });
                    } catch (error) {
                        console.error("Error fetching students:", error);
                    }
                    
                } else if (role === 'Student' && StudentID) {
                    try {
                        const studentDocs = await getDocs(query(collection(db, 'Student'), where('ID', '==', Math.floor(StudentID))));
                        if (!studentDocs.empty) {
                            const studentData = studentDocs.docs[0].data();
                            const supervisorIDs = studentData.SupervisorID;  // Retrieve SupervisorID array from student doc
                            
                            // Query supervisor collection based on SupervisorIDs
                            const supervisorDocs = await getDocs(query(collection(db, 'Supervisor'), where('ID', 'in', supervisorIDs)));
                            supervisorDocs.forEach((doc) => {
                                const data = doc.data();
                                supervisorsArray.push({
                                    SupervisorID: data.ID,
                                    SupervisorName: data.Name,
                                    SupervisorSurname: data.Surname,
                                    SupervisorCourseName: data.CourseName,
                                    ProfilePicture: data.ProfilePicture || avatar,
                                    Title: data.Title
                                });
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching supervisors:", error);
                    }
                } else if (role === 'Admin' && AdminID) {
                    try {
                        console.log('this the admin id under the role checking', role,'admin:',AdminID)
                        const examinerDoc=await getDocs(collection(db,'Examiner'),where('AdminID','==',Math.floor(AdminID)));
                        examinerDoc.forEach((doc)=>{
                            const data=doc.data();
                            examinerArray.push({
                                ExaminerID:data.ID,
                                Name:data.Name,
                                Surname:data.Surname,
                                Title:data.Title ,
                                Department:data.Department
                            })
                        })
                    } catch (error) {
                        console.error("Error fetching examiners details:", error);
                    } 
                }else if(role === 'Examiner'){
                    try {
                        console.log('this the admin id under the role checking', role,'admin:',AdminID)
                        const adminDoc=await getDocs(collection(db,'Admin'),where('ExaminerID','==',Math.floor(ExaminerID)));
                        adminDoc.forEach((doc)=>{
                            const data=doc.data();
                            adminArray.push({
                                AdminID:data.ID,
                                Name:data.Name,
                                Surname:data.Surname,
                                Title:data.Title,
                                Department:data.Department
                            })
                        })
                    } catch (error) {
                        console.error("Error fetching admins details:", error);
                        
                    }
                }
                setStudentDetails(studentdetsArray);
                setSupervisorDetails(supervisorsArray);
                setCourseOptions(courseIdArray);
                setAdminDetails(adminArray);
                setExaminerDetails(examinerArray);
            } catch (error) {
                console.error("Error fetching details:", error);
            }
        };
        
        fetchDetails();
    }, [StudentID, SupervisorID, role, filterCourseID,SupervisorID,ExaminerID,AdminID]);
    
    // Function to create or get the chat document
    const createOrGetChat = async (user1, user2) => {
        // Create a consistent chat ID by ordering user IDs
        const chatId = user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
        const chatRef = doc(db, 'chats', chatId);
        
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
            // Create a new chat document
            await setDoc(chatRef, {
                users: [user1, user2],
                createdAt: serverTimestamp(),
            });
            console.log("New chat document created with ID:", chatId);
        } else {
            console.log("Chat document already exists with ID:", chatId);
        }
        
        return chatId;
    };
    
    const handleLecturerClick = async (lecturer) => {
        setSelectedLecturer(lecturer);
        
        const currentUserId = role === 'Supervisor' ? SupervisorID : StudentID;
        
        // Create or get chat between the current user and the selected lecturer
        const newchatId = await createOrGetChat(currentUserId, lecturer.SupervisorID);
        
        // You can now use this chatId to load or send messages
        setChatId(newchatId);
        setIsModalOpen(true);
    };
    
    
    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        const currentUserId = role === 'Supervisor' ? SupervisorID : StudentID;
        
        // Create or get chat between the current user and the selected student
        const newChatId = await createOrGetChat(currentUserId, student.StudentID);
        
        setChatId(newChatId);
        // You can now use this chatId to load or send messages
        setIsModalOpen(true);
    };
    const handleExaminerClick = async (examiner) => {
        setSelectedExaminer(examiner);

        const currentUserId = role === 'Admin' ? AdminID : ExaminerID;
        
        // Create or get chat between the current user and the selected lecturer
        const newchatId = await createOrGetChat(currentUserId, examiner.ExaminerID);
        
        // You can now use this chatId to load or send messages
        setChatId(newchatId);
        setIsModalOpen(true);
    };
    
    const handlerAdminClick = async (admin) => {
        setSelectedAdmin(admin);
        //setAdminDetails(admin);
        const currentUserId = role === 'Examiner' ? ExaminerID : AdminID;
        
        // Create or get chat between the current user and the selected lecturer
        const newchatId = await createOrGetChat(currentUserId, admin.AdminID);
        
        // You can now use this chatId to load or send messages
        setChatId(newchatId);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setChatId(null); // Reset chatId when closing the modal
    };
    

    const handleFilterByStudentType = (studentType) => {
        setSelectedStudentType(studentType); // Set the selected student type

    };

    const filteredStudents = studentDetails.filter(student => {
        if (!selectedStudentType) return true;
        return student.StudentType == selectedStudentType;
    })

    const borderColors = ['border-[#00ad43]', 'border-[#00bfff]', 'border-[#590098]', 'border-[#FF8503]'];

    return (
        <div className="p-4 sm:ml-6 sm:mr-6 lg:ml-72 lg:mr-72">
            <div className="p-4 border min-h-screen border-gray-200 border-dashed rounded-lg dark:border-gray-700 dark:bg-gray-800">
                <section className="mb-2">
                    <h1 className="text-3xl font-extrabold tracking-wider text-gray-800 dark:text-gray-200">
                        {role === 'Student' ? 'Your Inbox' 
                        : role === 'Supervisor' ? 'Supervisor Inbox'
                        : role === 'Admin' ? 'Admin Inbox'
                        : role === 'Examiner' ? 'Examiner Inbox': null}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 mb-6">
                        {role === 'Student'
                            ? 'Here you can view all your messages and supervisors.'
                            : role === 'Supervisor'
                                ? 'Here you can view all your messages and students.'
                            : role === 'Admin'
                                ? 'Here you can view all your messages,  external examiners.'
                            : role === 'Examiner'
                                ? 'Here you can view all your messages, with admins.'
                            :'Something is wrong rn '}
                    </p>
                </section>
                {/* Display lecturers */}
                {role === 'Student' ? (
                    <div className="flex flex-wrap gap-2 max-w-full">
                        {supervisorDetails &&
                            supervisorDetails.map((lecturer, index) => (
                                <motion.div
                                    key={lecturer.SupervisorID}
                                    className={`flex items-center p-4 mb-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full rounded-lg shadow-md ${borderColors[index % borderColors.length]} border-2`}
                                    onClick={() => handleLecturerClick(lecturer)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {lecturer.ProfilePicture ? (
                                          <img
                                          src={lecturer.ProfilePicture}
                                          alt={lecturer.SupervisorName}
                                          className="w-12 h-12 mr-4 rounded-full"
                                      />
                                    ):(
                                        <div className="w-12 h-12 mr-4 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                                        {lecturer.SupervisorName.charAt(0)}{lecturer.SupervisorSurname.charAt(0)}
                                      </div>  
                                    )}
                                  
                                    <div className="flex flex-row flex-1 justify-items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            {lecturer.Title} {lecturer.SupervisorName} {lecturer.SupervisorSurname}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Office Hours: 8:00 - 16:00
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Supervisor ID: {lecturer.SupervisorID}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                ) : role === 'Supervisor' ? (
                    <div className="flex flex-wrap gap-2 max-w-full">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.StudentID}
                                className={`flex items-center p-4 mb-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full rounded-lg shadow-md ${borderColors[index % borderColors.length]} border-2`}
                                onClick={() => handleStudentClick(student)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <img
                                    src={student.ProfilePicture}
                                    alt={student.StudentName}
                                    className="w-12 h-12 mr-4 rounded-full"
                                />
                                <div className="flex flex-row flex-1 justify-items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {student.StudentName} {student.StudentSurname}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Student Type: {student.StudentType}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      Student ID: {student.StudentID}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : role === 'Admin' ? (
                    <div className="flex flex-wrap gap-2 max-w-full">
                        {examinerDetails &&
                            examinerDetails.map((examiner, index) => (
                                <motion.div
                                    key={examiner.ExaminerID}
                                    className={`flex items-center p-4 mb-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full rounded-lg shadow-md ${borderColors[index % borderColors.length]} border-2`}
                                    onClick={() => handleExaminerClick(examiner)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={examiner.ProfilePicture}
                                        alt={examiner.Name}
                                        className="w-12 h-12 mr-4 rounded-full"
                                    />
                                    <div className="flex flex-row flex-1 justify-items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            {examiner.Title} {examiner.Name} {examiner.Surname}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Office Hours: 8:00 - 16:00
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Examiner ID: {examiner.ExaminerID}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                ) : role === 'Examiner' ? (
                    <div className="flex flex-wrap gap-2 max-w-full">
                        {adminDetails &&
                            adminDetails.map((admin, index) => (
                                <motion.div
                                    key={admin.ID}
                                    className={`flex items-center p-4 mb-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full rounded-lg shadow-md ${borderColors[index % borderColors.length]} border-2`}
                                    onClick={() => handlerAdminClick(admin)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={admin.ProfilePicture}
                                        alt={admin.Name}
                                        className="w-12 h-12 mr-4 rounded-full"
                                    />
                                    <div className="flex flex-row flex-1 justify-items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                            {admin.Title} {admin.Name} {admin.Surname}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Office Hours: 8:00 - 16:00
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Department: {admin.Department}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                    ):
                    console.log("There is nothing ")
                }

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    data={role === 'Student' ? selectedLecturer 
                        : role === 'Supervisor'? selectedStudent 
                        : role === 'Admin' ? selectedExaminer
                        : role === 'Examiner'? selectedAdmin
                        : null }
                    role={role}
                    chatId={chatId}
                />
                <Footer />
            </div>

            {/* Modal */}
            {/* <Modal isOpen={isModalOpen} onClose={closeModal} lecturer={selectedLecturer} student={selectedStudent} /> */}

        </div>
    );
};