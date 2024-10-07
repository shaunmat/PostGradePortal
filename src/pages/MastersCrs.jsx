import { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../backend/authcontext";
import { collection, getDocs, addDoc, Timestamp, query, orderBy, doc, getDoc } from "firebase/firestore";
import { HiPlus, HiChevronLeft } from "react-icons/hi";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { storage } from "../backend/config";
import { db } from "../backend/config";
import { motion } from "framer-motion";
import { Footer } from "../components/Footer";
import BannerImg from '../assets/images//RegImage2.jpg';
// import { TaskModal } from "../components/TaskModal"; // Adjust the import path as needed
import { DataTable } from 'simple-datatables';
import { Spinner } from "flowbite-react";

export const MastersCrs = () => {
    const { UserData, Loading } = useAuth();
    const { researchId } = useParams();
    const navigate = useNavigate();
    const [Assignments, setAssignments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [courseDetails, setCourseDetails] = useState({});
    const [topics, setTopics] = useState([]);
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDescription, setNewTopicDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!Loading && UserData) {
            fetchAssignmentData();
        }
    }, [Loading, UserData]);


    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                if (!researchId) {
                    throw new Error('Course ID is undefined or null');
                }

                const moduleRef = doc(db, 'Module', researchId);
                const moduleSnap = await getDoc(moduleRef);

                if (moduleSnap.exists()) {
                    const moduleData = moduleSnap.data();
                    setCourseDetails({
                        id: researchId,
                        name: moduleData.ModuleTitle || 'Sample Course',
                        instructor: 'Dr. Placeholder',
                        description: moduleData.ModuleDescription || 'Description not available',
                    });
                } else {
                    console.error('No such module!');
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        fetchCourseDetails();
    }, [researchId, setCourseDetails]);

    const fetchAssignmentData = async () => {
        const cachedAssignments = localStorage.getItem('mastersAssignments');
        if (cachedAssignments) {
            setAssignments(JSON.parse(cachedAssignments));
        } else {
            const courseTypesArray = await fetchResearchAssignments(UserData.CourseID);
            setAssignments(courseTypesArray);
            localStorage.setItem('mastersAssignments', JSON.stringify(courseTypesArray)); // Cache data
        }
    };

    const fetchResearchAssignments = async (CourseIDs) => {
        const typesSet = [];

        try {
            for (const courseID of CourseIDs) {
                const AssignmentRef = collection(db, 'Module', courseID, "Assignments");
                const q = query(AssignmentRef, orderBy("AssignmentCreation", "desc")); // Order by creation date, descending
                const AssignmentSnap = await getDocs(q);

                AssignmentSnap.forEach((docSnap) => {
                    if (docSnap.exists()) {
                        const moduleData = docSnap.data();
                        typesSet.push({
                            id: docSnap.id, // Add the document ID
                            ...moduleData,
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching course types:', error);
        }

        return typesSet;
    };

    const handleSave = async () => {
        // Check if all required fields are filled
        if (!newTaskName || !newTaskDescription || !newTaskDueDate) {
            console.error("Please fill all fields.");
            return;
        }
    
        try {
            // Get current date and time for the creation date
            const creationDate = new Date();
            
            // Convert dates to Firestore Timestamp format
            const dueDate = new Date(newTaskDueDate); // Convert due date to Date object
            const creationTimestamp = Timestamp.fromDate(creationDate); // Convert to Firestore Timestamp
            
            // Use the first element of the CourseID array for the collection path
            const courseID = UserData.CourseID[0];
    
            // Add the new assignment to Firestore
            await addDoc(collection(db, 'Module', courseID, "Assignments"), {
                AssignmentTitle: newTaskName,
                AssignmentDescription: newTaskDescription,
                AssignmentDueDate: Timestamp.fromDate(dueDate), // Convert to Firestore Timestamp
                AssignmentCreation: creationTimestamp,
            });
    
            // Fetch and cache updated assignment data
            await fetchAssignmentData();
            setIsModalOpen(false);
            setNewTaskName("");
            setNewTaskDescription("");
            setNewTaskDueDate("");
        } catch (error) {
            console.error("Error adding new assignment:", error);
        }
    }; 
    
    const assignmentsTableRef = useRef(null);
    useEffect(() => {
        if (Assignments.length > 0) {
            if (assignmentsTableRef.current) {
                assignmentsTableRef.current.destroy(); // Destroy existing instance
            }
    
            setTimeout(() => {
                // Initialize the DataTable after rendering the DOM element
                assignmentsTableRef.current = new DataTable("#assignmentsTable", {
                    searchable: false,
                    sortable: false,
                    perPageSelect: false,
                    perPage: 10,
                    labels: {
                        placeholder: "Search assignments...",
                        perPage: "{select} assignments per page"
                    },
                    layout: {
                        top: "{select}{search}",
                        bottom: "{info}{pager}"
                    }
                });
    
                // Make rows clickable
                document.querySelectorAll('#assignmentsTable tbody tr').forEach((row, index) => {
                    row.addEventListener('click', () => {
                        navigate(`/masters/${UserData.CourseID[0]}/assignments/${Assignments[index].id}`);
                    });
                });
            }, 1000); // Delay initialization to ensure DOM is updated
        }
    
        return () => {
            if (assignmentsTableRef.current) {
                assignmentsTableRef.current.destroy(); // Cleanup on component unmount
            }
        };
    }, [Assignments, navigate, UserData.CourseID]);

    const fetchTopics = async () => {
        try {
            const topicsRef = ref(storage, 'r_topics/topics.json');
            const url = await getDownloadURL(topicsRef);
            const response = await fetch(url);
            const topicsData = await response.json();
            const filteredTopics = topicsData.filter((topic) => topic.courseId === researchId);
    
            if (Array.isArray(filteredTopics)) {
                setTopics(filteredTopics);
            } else {
                console.error("Fetched topics are not an array");
                setTopics([]);
            }
        } catch (error) {
            console.error("Error fetching topics:", error);
            setTopics([]);
        }
    };   
    
    const handleAddTopic = async () => {
        if (!newTopicName || !newTopicDescription) {
            alert("Please fill in both the topic name and description.");
            return;
        }
        setLoading(true);
        try {
            const courseID = researchId;
            console.log("Adding topic for course ID:", courseID);
    
            const newTopic = {
                id: uuidv4(),
                topicName: newTopicName,
                description: newTopicDescription,
                isSelected: false,
                selectedBy: null,
                courseId: courseID
            };
    
            const updatedTopics = [...topics, newTopic];
            setTopics(updatedTopics); 
    
            const updatedTopicsBlob = new Blob([JSON.stringify(updatedTopics)], { type: 'application/json' });
            const topicsRef = ref(storage, 'r_topics/topics.json');
            await uploadBytes(topicsRef, updatedTopicsBlob);
    
            // Clear input fields
            setNewTopicName('');
            setNewTopicDescription('');
    
            await fetchTopics();
    
            toast.success('Topic added successfully!');
            // Close the modal
            setIsTopicModalOpen(false);
    
        } catch (error) {
            console.error("Error adding topic:", error);
            toast.error('Error adding topic. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (topics.length > 0) {
            const table = new DataTable("#topicsTable", {
                searchable: false,
                sortable: false,
                perPageSelect: false,
                perPage: 10,
                labels: {
                    placeholder: "Search topics...",
                    perPage: "{select} topics per page"
                },
                layout: {
                    top: "{select}{search}",
                    bottom: "{info}{pager}"
                }
            });

            return () => table.destroy();
        }
    }, [topics]);
    

    if (!courseDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="xl" color="warning" />
            </div>
        );
    }


    return (
        <div className="p-4 sm:ml-6 sm:mr-6 lg:ml-72 lg:mr-72">
            <div className="p-4 border-2 border-gray-200  rounded-lg dark:border-gray-700 dark:bg-gray-800">                {/* Header with Add Button */}
                <section className="mb-6 flex justify-between items-center" style={{display: "none"}}>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wider text-gray-800 dark:text-gray-200">
                            Masters
                        </h1>
                        <p className="text-lg font-normal mt-5 text-gray-700 dark:text-gray-400">
                            Here are all the assignments you have posted.
                        </p>
                    </div>
                    <button 
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <HiPlus className="mr-2" />
                        Add New Milestone
                    </button>
                </section>

                <section className="max-h-80 mb-4 flex items-center justify-center w-full overflow-hidden rounded-lg relative">
                    <img src={BannerImg} alt="Banner" className="w-full h-full object-cover" />
                    <h1 className="absolute text-4xl font-bold tracking-wider text-white dark:text-gray-200">
                        {courseDetails.name}
                    </h1>
                    {/* Add back button */}
                    <button
                        className="absolute top-3 left-3 flex items-center px-4 py-2 bg-[#00bfff] text-white rounded-lg"
                        onClick={() => navigate(-1)}
                    >
                        <HiChevronLeft className="mr-2" />
                        Back
                    </button>
                </section>

                <section className="mb-6 border-2 border-[#00bfff] rounded-lg p-4">
                    <h3 className="text-xl font-bold text-[#00bfff]">Research Milestones</h3>
                    <p>Here are all the milestones you have posted.</p>
                    
                    <table id="assignmentsTable" className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Milestone</th>
                                <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Due Date</th>
                                <th className="border px-4 py-2">Created On</th>
                            </tr>
                        </thead>


                        <tbody>
                            {Assignments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                                        No assignments have been added yet.
                                    </td>
                                </tr>
                            ) : (
                                Assignments.map((assignment, index) => (
                                    <tr key={index} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <td className="border px-4 py-2">{assignment.AssignmentTitle}</td>
                                        <td className="border px-4 py-2">{assignment.AssignmentDescription}</td>
                                        <td className="border px-4 py-2">{new Date(assignment.AssignmentDueDate.seconds * 1000).toLocaleString()}</td>
                                        <td className="border px-4 py-2">{new Date(assignment.AssignmentCreation.seconds * 1000).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 mt-4 bg-[#00bfff] text-white rounded"
                    >
                        Add New Milestone
                    </button>

                </section>


                <div className="flex flex-col gap-7" style={{display: "none"}}>
                    {Assignments.length > 0 ? Assignments.map((assignment, index) => (
                        // Pass both courseId and assignmentId in the Link
                        <Link 
                            to={`/masters/${UserData.CourseID[0]}/assignments/${assignment.id}`}
                            key={index} 
                            className="block w-full"
                        >
                            <motion.div 
                                className="border-2 rounded-lg overflow-hidden shadow-md p-4 w-full"
                                whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <h2 className="text-xl font-bold">{assignment.AssignmentTitle}</h2>
                                <p>{assignment.AssignmentDescription}</p>
                                <p>Due Date: {new Date(assignment.AssignmentDueDate.seconds * 1000).toLocaleString()}</p>
                                <p>Created On: {new Date(assignment.AssignmentCreation.seconds * 1000).toLocaleString()}</p>
                            </motion.div>
                        </Link>
                    )) : (
                        <p>No assignments available.</p>
                    )}
                </div>

                <section className="mt-6 border-2 border-[#00ad43] rounded-lg p-4">
                    <h2 className="text-xl font-bold text-[#00ad43] dark:text-gray-200">Research Topics</h2>
                    <p className="text-gray-700 mt-2 text-md dark:text-gray-400">
                        Here are all the research topics available for this course.
                    </p>

                    <table id="topicsTable" className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Topic Name</th>
                                <th className="border px-4 py-2">Description</th>
                                <th className="border px-4 py-2">Status</th>
                                <th className="border px-4 py-2">Student Number</th>
                            </tr>
                        </thead>
                        <tbody>
                        {topics.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="border px-4 py-2 text-center text-gray-500">
                                    No topics have been added yet.
                                </td>
                            </tr>
                        ) : (
                            topics.map((topic, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{topic.topicName}</td>
                                    <td className="border px-4 py-2">{topic.description}</td>
                                    <td className="border px-4 py-2">{topic.isSelected ? "Selected" : "Available"}</td>
                                    <td className="border px-4 py-2">{topic.selectedBy || "None"}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <button
                        onClick={() => setIsTopicModalOpen(true)}
                        className="px-4 py-2 mt-4 bg-[#00ad43] text-white rounded"
                    >
                        Add New Topic
                    </button>
                </section>

                {/* Task Modal */}
                <TaskModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    setNewTaskName={setNewTaskName} 
                    setNewTaskDescription={setNewTaskDescription} 
                    setNewTaskDueDate={setNewTaskDueDate} 
                />

                {/* Topic Modal */}
                <TopicModal
                    isOpen={isTopicModalOpen}
                    onClose={() => setIsTopicModalOpen(false)}
                    onSave={handleAddTopic}
                    setNewTopicName={setNewTopicName}
                    setNewTopicDescription={setNewTopicDescription}
                />

                
            </div>
        </div>
    );
};

import { HiOutlinePencilAlt, HiOutlineXCircle } from "react-icons/hi"; // Updated icons

const TaskModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    setNewTaskName, 
    setNewTaskDescription, 
    setNewTaskDueDate 
}) => {
    if (!isOpen) return null;

    const handleSave = () => {
        onSave(); // Call the onSave function
        // Clear input values if necessary
        setNewTaskName('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                {/* Close button */}
                <button 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none" 
                    onClick={onClose}
                >
                    <HiOutlineXCircle className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center mb-4">
                    <HiOutlinePencilAlt className="w-8 h-8 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Add New Milestone</h2>
                </div>

                {/* Milestone Title Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Title</label>
                    <input 
                        type="text" 
                        placeholder="Enter Milestone Title"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewTaskName(e.target.value)}
                    />
                </div>

                {/* Milestone Description Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Description</label>
                    <textarea 
                        placeholder="Enter Milestone Description" 
                        className="w-full h-14 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                    />
                </div>

                {/* Due Date Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input 
                        type="datetime-local" 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg focus:ring focus:ring-gray-200"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:ring focus:ring-blue-200"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};


const TopicModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    setNewTopicName, 
    setNewTopicDescription 
}) => {
    if (!isOpen) return null;

    const handleSave = () => {
        onSave(); // Call the onSave function
        // Clear input values if necessary
        setNewTopicName('');
        setNewTopicDescription('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div 
                className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
            >
                {/* Close button */}
                <button 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none" 
                    onClick={onClose}
                >
                    <HiOutlineXCircle className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center mb-4">
                    <HiOutlinePencilAlt className="w-8 h-8 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Add New Topic</h2>
                </div>

                {/* Topic Name Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                    <input 
                        type="text" 
                        placeholder="Enter topic name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                </div>

                {/* Topic Description Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        placeholder="Enter topic description" 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                    />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg focus:ring focus:ring-gray-200"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:ring focus:ring-blue-200"
                    >
                        Save
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
