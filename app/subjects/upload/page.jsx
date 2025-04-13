'use client';
import { useState, useEffect } from 'react';
import { storage, auth } from "@/constants/firebase"; // Ensure you import auth
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null); // State to store the selected folder
    const [user, loading] = useAuthState(auth); // Get the current user
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown visibility
    const [isUploading, setIsUploading] = useState(false); // State to track upload status
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchUserFolders(user.uid); // Fetch folders when user is available
        } else if (!loading) {
            router.push('/login'); // Redirect to login if not authenticated
        }
    }, [user, loading, router]);

    // Fetch user folders from Firebase
    const fetchUserFolders = (userId) => {
        const db = getDatabase();
        const foldersRef = ref(db, `folders/${userId}`);

        onValue(foldersRef, (snapshot) => {
            const foldersData = snapshot.val();
            if (foldersData) {
                const fetchedFolders = Object.entries(foldersData).map(([folderId, folder]) => ({
                    id: folderId,
                    name: folder.name,
                    createdAt: folder.createdAt,
                }));
                setFolders(fetchedFolders);
            } else {
                setFolders([]); // Set to empty if no folders found
            }
        }, (error) => {
            console.error("Error fetching folders:", error);
        });
    };

    // Handle file upload to Firebase Storage
    const handleFileUpload = async (event) => {
        event.preventDefault();
    
        if (file === null || selectedFolder === null) {
            console.error("File or folder not selected");
            return; 
        }
        
        setIsUploading(true); // Start loading sign

        try {
            const storageReference = storageRef(storage, `files/${file.name}`);
            await uploadBytes(storageReference, file);
    
            const db = getDatabase();
            // Correct the folder path to reference the subject folder properly
            const folderPath = `folders/${user.uid}/${selectedFolder}/files`; 
            const fileId = new Date().getTime().toString(); // Use a timestamp as the file ID
            const fileRef = ref(db, `${folderPath}/${fileId}`); 
    
            await set(fileRef, {
                name: file.name,
                uploadedAt: new Date().toISOString(),
            });
    
            setFile(null);
            alert("File uploaded successfully!");
            router.push('/dashboard');  
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false); // Stop loading sign
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading state while authenticating
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-500 text-white">
            <h1 className="text-2xl font-bold mb-4">Upload a File</h1>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
            />
            <button
                onClick={handleFileUpload}
                className="bg-brand-primary-500 text-base-500 py-2 px-4 rounded-md"
                disabled={isUploading} // Disable button while uploading
            >
                {isUploading ? "Uploading..." : "Upload File"}
            </button>

            {isUploading && <div className="mt-4">Uploading your file, please wait...</div>} {/* Loading sign */}

            <h2 className="text-xl mt-6">Your Folders:</h2>

            {/* Dropdown Menu for Folders */}
            <div className="relative inline-block text-left">
                <div>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                    >
                        {selectedFolder ? folders.find(folder => folder.id === selectedFolder)?.name : 'Select a Folder'}
                        <svg
                            className="-mr-1 ml-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {folders.length > 0 ? (
                                folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => {
                                            setSelectedFolder(folder.id); // Set selected folder
                                            setIsDropdownOpen(false); // Close dropdown
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                                    >
                                        {folder.name}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-400">No folders found.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
