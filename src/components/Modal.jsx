import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendMessage } from '../components/SendMessage';
import { HiOutlineXCircle } from "react-icons/hi";
import { ChatBubble } from '../components/ChatBubble';
import avatar from "../assets/images/Avatar.png";
import { db, auth } from '../backend/config';
import { doc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Badge } from 'flowbite-react';
import "../../src/chat.css";

export const Modal = ({ chatId, isOpen, onClose, data, role }) => {
    const defaultAvatar = avatar;
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!chatId || !isOpen) return;

        const chatRef = doc(db, 'chats', chatId);
        const messagesQuery = query(
            collection(chatRef, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            console.log("Fetched messages:", msgs);
        });
        return () => unsubscribeMessages();
    }, [chatId, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose} // Close modal on clicking the overlay
                    />

                    {/* Modal window */}
                    <motion.div
                        className="fixed z-50 inset-0 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <img src={data?.ProfilePicture || defaultAvatar} alt="Profile" className="w-10 h-10 rounded-full mr-4" />
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {role === 'Student' ? `${data?.Title} ${data?.SupervisorSurname}` 
                                            : role === 'Supervisor'? ` ${data?.StudentName} ${data?.StudentSurname}`
                                            : role === 'Admin'? `${data?.Title} ${data?.Name} ${data?.Surname}`
                                            : role === 'Examiner'? `${data?.Title} ${data?.Name} ${data?.Surname}`
                                            : 'something is wrong'}
                                        </h3>
                                        {/* Display Course Name instead of ID */}
                                        <p className="text-sm">{role === 'Student' ? data?.courseName : data?.StudentType}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                    <HiOutlineXCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="msgs overflow-y-auto flex-grow scrollbar-hide">
                                {/* Disclaimer with Badge */}
                                <div className="mb-4 mt-2 flex justify-center items-center">
                                    <Badge color="info" className="text-center font-xs">
                                        <strong>{role === 'Student' ? 'Disclaimer' : 'Notice'}</strong>
                                        <p>
                                            {role === 'Student'
                                                ? "Please be aware that this chat is for educational purposes only. Any topics discussed outside of this context are not permitted."
                                                : "You have started a chat with a student. Please keep the conversation professional and relevant to the course."
                                            }
                                        </p>
                                    </Badge>
                                </div>

                                {role === 'Student' ? (
                                    <div className="mb-4 mt-2 flex justify-center items-center"> {/* Center the content */}
                                        <Badge color="info" className="text-center font-xs"> {/* Center the text */}
                                            <strong>Disclaimer</strong>
                                            <p>Please be aware that this chat is for educational purposes only. Any topics discussed outside of this context are not permitted.</p>
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="mb-4 mt-2 flex justify-center items-center"> {/* Center the content */}
                                        <Badge color="info" className="text-center font-xs"> {/* Center the text */}
                                            <strong>Notice</strong>
                                            <p>You have started a chat with a {role === 'Supervisor' ? 'student' 
                                                                                : role === 'Student' ? 'supervisor' 
                                                                                : role === 'Examiner' ?'admin'
                                                                                :role === 'Admin' ? 'examiner'
                                                                                : null}. Please keep the conversation professional and relevant to the course.</p>
                                        </Badge>
                                    </div>
                                )}
                                {messages.map((message) => (
                                    <div key={message.id} className="mb-4">
                                        <ChatBubble
                                            message={{
                                                avatar: message.photoURL || defaultAvatar,
                                                sender: message.sender,
                                                time: new Date(message.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                content: message.text,
                                                status: message.status
                                            }}
                                            isSent={message.sender === auth.currentUser.uid}
                                        />
                                    </div>
                                ))}
                                <div ref={scrollRef} /> {/* Scroll target */}
                            </div>

                            {/* SendMessage component fixed to the bottom */}
                            <SendMessage chatId={chatId} scrollRef={scrollRef} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
