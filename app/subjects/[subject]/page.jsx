'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/constants/firebase'; // Adjust the path to your Firebase configuration
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineDotsVertical } from "react-icons/hi";

export default function SubjectPage() {
    const { subject } = useParams();
    const [files, setFiles] = useState([]);
    const [user, setUser] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [folderId, setFolderId] = useState(null);
    const [fileOptions, setFileOptions] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const router = useRouter();
    const db = getDatabase();
    const storage = getStorage();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        if (!user) return;

        const fetchFiles = () => {
            const normalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
            const foldersRef = ref(db, `folders/${user.uid}`);

            onValue(foldersRef, (snapshot) => {
                const foldersData = snapshot.val();
                const filesList = [];

                if (foldersData) {
                    Object.entries(foldersData).forEach(([folderId, folder]) => {
                        if (folder.name?.toLowerCase() === normalizedSubject.toLowerCase()) {
                            const filesData = folder.files;
                            setFolderId(folderId);

                            if (filesData) {
                                const filePromises = Object.entries(filesData).map(([fileId, file]) => {
                                    const fileStorageRef = storageRef(storage, `files/${file.name}`);
                                    return getDownloadURL(fileStorageRef).then((url) => {
                                        const fileFormat = file.name.split('.').pop();
                                        return {
                                            id: fileId,
                                            name: file.name,
                                            uploadedAt: file.uploadedAt,
                                            url,
                                            format: fileFormat,
                                        };
                                    });
                                });

                                Promise.all(filePromises).then(fetchedFiles => {
                                    setFiles(fetchedFiles);
                                }).catch(error => {
                                    console.error("Error getting download URLs:", error);
                                });
                            }
                        }
                    });
                } else {
                    console.log(`No folders found for user: ${user.uid}`);
                }
            });
        };

        fetchFiles();
    }, [subject, user, db, storage]);

    const renameFolder = async (newName) => {
        if (folderId) {
            const folderRef = ref(db, `folders/${user.uid}/${folderId}`);
            await update(folderRef, { name: newName });
            setShowMenu(false);
            router.push('/dashboard');
        }
    };

    const deleteFolder = async () => {
        if (folderId) {
            const folderRef = ref(db, `folders/${user.uid}/${folderId}`);
            await remove(folderRef);
            setShowMenu(false);
            router.push('/dashboard');
        }
    };

    const deleteFile = async (fileId) => {
        if (folderId) {
            const fileRef = ref(db, `folders/${user.uid}/${folderId}/files/${fileId}`);
            await remove(fileRef);
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
            setFileOptions(null);
        }
    };

    const shareFile = async (fileId) => {
        if (folderId && shareEmail) {
            const sanitizedEmail = shareEmail.replace(/\./g, ',');
            const fileRef = ref(db, `folders/${user.uid}/${folderId}/files/${fileId}/sharedWith`);
            
            try {
                // Update database with the shared file
                await update(fileRef, { [sanitizedEmail]: true });
    
                // Call your send email API
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: shareEmail,
                        fileName: files.find(file => file.id === fileId)?.name,
                        subjectName: subject,
                        senderEmail: user.email,  // Sender's email from authentication
                        senderName: user.displayName || user.email,  // Sender's name or email if displayName is not available
                    }),
                });
    
                const data = await response.json();
    
                if (data.success) {
                    alert('File shared and notification sent!');
                } else {
                    console.error('Error sending notification email:', data.error);
                    alert('Error sending notification email');
                }
    
                setShowShareModal(false);
                setShareEmail('');
            } catch (error) {
                console.error("Error sharing file:", error);
                alert('Error sharing file or sending email');
            }
        } else {
            console.error("folderId or shareEmail is missing");
        }
    };
    
    
    

    const handleFileOptionsToggle = (fileId) => {
        setFileOptions(fileId === fileOptions ? null : fileId);
    };

    const handleShareModalOpen = (fileId) => {
        setSelectedFileId(fileId);
        setShowShareModal(true);
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="p-6">
                <div className='flex justify-between items-center'>
                    <h1 className="text-3xl font-bold capitalize">{subject}</h1>
                    <div className="relative">
                        <GiHamburgerMenu
                            className='text-2xl cursor-pointer duration-300 hover:text-base-300'
                            onClick={() => setShowMenu(!showMenu)}
                        />
                        {showMenu && (
                            <div className="absolute right-0 bg-white shadow-md rounded mt-2">
                                <button
                                    onClick={() => {
                                        const newName = prompt("Enter new folder name:", subject);
                                        if (newName) renameFolder(newName);
                                    }}
                                    className="block px-4 py-2 text-left text-base-500 hover:bg-gray-200"
                                >
                                    Rename Folder
                                </button>
                                <button
                                    onClick={deleteFolder}
                                    className="block px-4 py-2 text-left hover:bg-gray-200 text-red-600"
                                >
                                    Delete Folder
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="mt-4 text-lg">
                    Welcome to the {subject} page! Here you can find resources, study materials, and much more related to {subject}.
                </p>

                <div className="mt-8">
                    <h2 className="text-2xl font-semibold">Files</h2>
                    <ul className="list-disc mt-4 space-y-2">
                        {files.length > 0 ? (
                            files.map(file => (
                                <div
                                    className='flex items-center justify-between bg-base-400 rounded-md w-full py-4 px-4'
                                    key={file.id}
                                >
                                    <div className='flex items-center gap-2'>
                                        <p
                                            className={`text-xs px-2 py-1 w-fit rounded-md text-white ${file.format === 'pdf' ? 'bg-red-500' :
                                                file.format === 'ppt' ? 'bg-blue-500' :
                                                    file.format === 'link' ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                                }`}
                                        >
                                            {file.format.toUpperCase()}
                                        </p>
                                        <a href={file.url} className="truncate max-w-[8rem] text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                            {file.name}
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <HiOutlineDotsVertical
                                            className='cursor-pointer text-white duration-300 hover:text-base-100'
                                            onClick={() => handleFileOptionsToggle(file.id)}
                                        />
                                        {fileOptions === file.id && (
                                            <div className="absolute right-0 bg-white shadow-md rounded mt-2 w-32">
                                                <button
                                                    onClick={() => deleteFile(file.id)}
                                                    className="block px-4 py-2 w-full text-left text-red-600 hover:bg-gray-200"
                                                >
                                                    Delete File
                                                </button>
                                                <button
                                                    onClick={() => handleShareModalOpen(file.id)}
                                                    className="block px-4 py-2 w-full text-left text-blue-600 hover:bg-gray-200"
                                                >
                                                    Share via Email
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <li>No files available for this subject.</li>
                        )}
                    </ul>
                </div>
                {showShareModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white p-4 rounded-md shadow-lg">
                            <h2 className="text-xl text-black font-semibold">Share File</h2>
                            <input
                                type="email"
                                placeholder="Enter email to share"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                className="mt-4 p-2 border text-black border-gray-300 rounded-md w-full"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="mr-4 px-4 py-2 bg-gray-300 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => shareFile(selectedFileId)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
