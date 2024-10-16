import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../backend/authcontext";
import { collection, getDocs, addDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "../backend/config";
import { motion } from "framer-motion";
import { Footer } from "../components/Footer";
import BannerImage from '../assets/images/RegImage4.jpg'
import UserLogo from '../assets/images/Avatar.png';
import { HiPlus, HiChevronLeft } from "react-icons/hi";
import { TaskModal } from "../components/TaskModal"; // Adjust the import path as needed
import { doc, getDoc, setDoc } from "firebase/firestore";

export const StudentsData = () => {
    const navigate = useNavigate(); // Use navigate from react-router-dom
    const { UserData, Loading } = useAuth();
    const { StudentID } = useParams();
    const [Assignments, setAssignments] = useState([]);
    const [StudentData, setStudentData] = useState([]);
    const [FinalSubmission, setFinalSubmission] = useState({SubmissionPermission: false})
    const [CompletedSubmission, setCompletedSubmission] = useState([])
    const [ConfirmationChecked, setConfirmationChecked] = useState(false)
    const topics = [];
    const assignments = [];

    useEffect(() => {
        const ParameterSplitter = StudentID.split(",");
        const StudentsID = ParameterSplitter[0];
        const CourseID = ParameterSplitter[1];
        const GetStudentData = async () => {
            try {
                const StudentRef = doc(db, 'Student', StudentsID);
                const StudentSnap = await getDoc(StudentRef);
                
                const FinalSubmissionRef = doc(db, `Module/${CourseID}/Final Submission/${StudentsID}`);
                const FinalSubmissionSnap = await getDoc(FinalSubmissionRef);

                if (StudentSnap.exists()) {
                    const StudentData = StudentSnap.data();
                    setStudentData({
                        Name: StudentData.Name,
                        Surname: StudentData.Surname,
                        StudentType: StudentData.StudentType,
                        ID: StudentsID,
                        ProfilePicture: StudentData.ProfilePicture || UserLogo,
                        CourseID: CourseID,
                    });
                    
                    if(FinalSubmissionSnap.exists()){
                        setFinalSubmission(FinalSubmissionSnap.data())
                    } else {
                        setFinalSubmission({
                            SubmissionPermission: false
                        })
                    }
                } else {
                    console.error('No such module!');
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };
        const GetSubmissions = async () =>{
            //const SubmissionRef = doc(db, `Module/${CourseID}/Assignments/${StudentsID}`);
            const SubmissionRef = collection(db, 'Module', CourseID, 'Assignments');
            const SubmissionSnap = await getDocs(SubmissionRef);
            const SubmissionsArray = SubmissionSnap.docs.map(doc => ({
                ...doc.data(),
                AssignmentID: doc.id
            }));
            //setAssignments(SubmissionsArray);

            let CompletedSubmissionHolder = []
            console.log(SubmissionsArray)
            for (let Submission of SubmissionsArray) {
                const CompletedSubmissionRef = doc(db, `Module/${CourseID}/Assignments/${Submission.AssignmentID}/StudentID/${StudentsID}`);
                const CompletedSubmissionSnap = await getDoc(CompletedSubmissionRef);

                if (CompletedSubmissionSnap.exists()) {
                    const SubmissionData = {
                        SubmissionTitle: Submission.AssignmentTitle,
                        SubmissionDescription: Submission.AssignmentDescription,
                        SubmissionDownloadLink: CompletedSubmissionSnap.data().downloadURL
                    }
                    CompletedSubmissionHolder.push(SubmissionData)
                    console.log(SubmissionData)
                } else {
                    console.log("Omar Know that stuff off")
                }
            }
            console.log(CompletedSubmissionHolder)
            setCompletedSubmission(CompletedSubmissionHolder)
        }
        if (!Loading && UserData) {
            GetStudentData();
            GetSubmissions();
        }
        console.log()
    }, [Loading, UserData]);

    const handleFinalSubmissionUpdate = async () => {
        try {
            const FinalSubmissionRef = doc(db, `Module/${StudentData.CourseID}/Final Submission/${StudentData.ID}`);
            await setDoc(FinalSubmissionRef, {
                SubmissionPermission: !FinalSubmission.SubmissionPermission // Toggle the current permission
            }, { merge: true });
    
            // Update state to reflect the new permission immediately
            setFinalSubmission({
                ...FinalSubmission,
                SubmissionPermission: !FinalSubmission.SubmissionPermission
            });
    
            console.log('Submission permission updated successfully');
        } catch (error) {
            console.error('Error updating submission permission:', error);
        }
    };
    
    return (
        <div className="p-4 sm:ml-6 sm:mr-6 lg:ml-72 lg:mr-72">
            <div className="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">                
            <section className="max-h-80 flex items-center justify-center w-full overflow-hidden rounded-lg relative">
                <img src={BannerImage} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute flex flex-col items-center text-white dark:text-gray-200">
                    <img
                    src={StudentData.ProfilePicture}
                    className="w-24 h-24 rounded-full mb-4"
                    alt="avatar"
                    />
                    <h1 className="text-4xl font-bold tracking-wider">
                    {StudentData.Name} {StudentData.Surname}
                    </h1>
                    <p className="text-lg font-semibold">{StudentData.StudentType}</p>
                </div>

                <button
                    className="absolute top-3 left-3 flex items-center px-4 py-2 rounded-lg bg-[#FF8503] dark:bg-gray-700 shadow-md text-white font-medium dark:text-gray-200"
                    onClick={() => navigate(-1)}
                >
                    <HiChevronLeft className="mr-2" />
                    Back
                </button>
                </section>

            <section className="mt-6 border-2 border-[#FF8503] rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-[#FF8503] dark:text-gray-200">Student Details</h2>

                <div className="flex items-center gap-4 mt-4">
                    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        Student ID: <span className="text-gray-700 dark:text-gray-400">{StudentData.ID}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        Student Type: <span className="text-gray-700 dark:text-gray-400">{StudentData.StudentType}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                        Associated Course ID: <span className="text-gray-700 dark:text-gray-400">{StudentData.CourseID}</span>
                    </p>
                </div>
            </section>

    
            <section className="mt-6">

    <section className="mt-4 border-2 border-[#590098] rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800">
            {/* <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Submissions</h2> */}

        <h3 className="text-2xl font-extrabold text-[#590098] mb-4 dark:text-gray-200">Final Submission</h3>
        
        {!FinalSubmission.SubmissionPermission && (
            <label className="flex items-center mt-2 space-x-3">
                <input
                    type="checkbox"
                    checked={ConfirmationChecked}
                    onChange={(e) => setConfirmationChecked(e.target.checked)}
                    className="h-6 w-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700 dark:text-gray-400">
                    I confirm I want to enable {StudentData.Name} {StudentData.Surname}'s final submission
                </span>
            </label>
        )}

        <button
            className={`mt-4 px-4 py-2 rounded ${FinalSubmission.SubmissionPermission ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            onClick={handleFinalSubmissionUpdate}
            disabled={!ConfirmationChecked && !FinalSubmission.SubmissionPermission}
        >
            {FinalSubmission.SubmissionPermission ? 'Disable Final Submission' : 'Enable Final Submission'}
        </button>
    </section>

    <section className="mt-6 border-2 border-[#00bfff] rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-[#00bfff] dark:text-gray-200">Submissions</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-400">Here are all the submissions made by {StudentData.Name} {StudentData.Surname}.</p>

        <ul className="mt-2 space-y-4">
            {CompletedSubmission.length > 0 ? CompletedSubmission.map((Submission, index) => (
                <li key={index} className="p-4 rounded-lg dark:bg-gray-900 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{Submission.SubmissionTitle}</h3>
                    <p className=" text-gray-700 dark:text-gray-400">{Submission.SubmissionDescription}</p>
                    <a
                        href={Submission.SubmissionDownloadLink}
                        className="mt-2 inline-block text-blue-600 hover:underline"
                        target="_blank" rel="noopener noreferrer"
                    >
                        Download Submission
                    </a>
                </li>
            )) : (
                <p className="mt-2 text-gray-700 dark:text-gray-400">They have not completed any of your submissions.</p>
            )}
        </ul>
    </section>

    {/* <ul className="mt-4 space-y-4">
        {CompletedSubmission.length > 0 ? CompletedSubmission.map((Submission, index) => (
            <li key={index} className="border-2 border-[#FF8503] p-4 rounded-lg dark:bg-gray-900 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{Submission.SubmissionTitle}</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-400">{Submission.SubmissionDescription}</p>
                <a
                    href={Submission.SubmissionDownloadLink}
                    className="mt-2 inline-block text-blue-600 hover:underline"
                    target="_blank" rel="noopener noreferrer"
                >
                    Download Submission
                </a>
            </li>
        )) : (
            <p className="mt-2 text-gray-700 dark:text-gray-400">They have not completed any of your submissions.</p>
        )}
    </ul> */}
</section>

            </div>
            <Footer />
        </div>
    );    
};