'use client';
import Topbar from "../components/Molecular/topbar";
import Navbar from "../components/Organism/navBar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/constants/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";
import Link from "next/link";

export default function Home() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        if (!user && !loading) {
            router.push("/login");
        } else if (user) {
            fetchFolders(user.uid);
        }
    }, [user, loading, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    // Toggle popup visibility
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    // Function to add a folder to Firebase under the user's directory
    const addFolderToFirebase = async (folderName) => {
        const db = getDatabase();
        const folderId = new Date().getTime().toString(); // Unique folder ID
        const folderRef = ref(db, `folders/${user.uid}/${folderId}`); // Save the folder under user's UID with a unique ID
        await set(folderRef, {
            name: folderName,
            userId: user.uid,
            email: user.email,
            createdAt: new Date().toISOString(),
        });
    };

    // Function to fetch folders from Firebase for the authenticated user
    const fetchFolders = (userId) => {
        const db = getDatabase();
        const foldersRef = ref(db, `folders/${userId}`);
        
        onValue(foldersRef, (snapshot) => {
            const foldersData = snapshot.val();
            const userFolders = foldersData
                ? Object.entries(foldersData).map(([id, folder]) => ({
                      id,
                      name: folder.name || "Unnamed Folder",
                      createdAt: folder.createdAt,
                  }))
                : [];
            setFolders(userFolders);
        });
    };

    return (
        <>
            <div className="h-screen flex flex-col relative">
                <Topbar />

                {/* Search Input */}
                <div className="mt-5 space-y-5">
                    <div className="bg-base-400 flex px-4 rounded-lg justify-between">
                        <img src="/icons/search.svg" alt="" />
                        <input type="text" className="bg-transparent py-4 outline-none" placeholder="Search subjects..." />
                    </div>
                </div>

                {/* Subjects Section */}
                <div className="mt-5 flex-1 relative overflow-y-auto px-4 space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Render folders dynamically */}
                        {folders.length > 0 ? (
                            folders.map(folder => (
                                <Link href={`/subjects/${folder.name}`} key={folder.id} className="text-white text-center h-32 grid place-content-center rounded-md p-4 bg-base-400 shadow hover:bg-base-300 duration-300">
                                    <h3 className="text-lg font-semibold">{folder.name}</h3>
                                </Link>
                            ))
                        ) : (
                            <div>No folders found.</div>
                        )}
                    </div>
                </div>

                {/* Navbar */}
                <div className="absolute bottom-0 w-full">
                    <Navbar />
                </div>
            </div>

            <div className="absolute bottom-28 ml-48 z-10">
                <button
                    className="flex gap-3 items-center bg-white rounded-md duration-300 hover:bg-base-100 hover:text-white text-base-500 font-semibold px-4 py-2"
                    onClick={togglePopup}
                >
                    <span className="text-2xl">+</span>
                    <span>Add</span>
                </button>
            </div>

            {/* Popup */}
            <div
                className={`fixed bottom-0 mx-auto w-full z-20 lg:w-1/5 md:w-1/2 bg-base-400 p-6 rounded-t-xl shadow-xl transform transition-transform duration-300 ${isPopupOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Add</h2>
                    <button onClick={togglePopup} className="text-gray-500">
                        Close
                    </button>
                </div>
                <div className="mt-4">
                    <div className="flex text-xs justify-between w-full text-center">
                        <button
                            className="flex flex-col justify-between items-center hover:bg-base-300 duration-300 py-4 rounded-md"
                            onClick={() => {
                                const folderName = prompt("Enter the folder name:");
                                if (folderName && folderName.trim()) {
                                    addFolderToFirebase(folderName.trim());
                                }
                            }}
                        >
                            <img src='/icons/create_new_folder.svg' alt="" className="p-4" />
                            <p className="w-full">Add Folder</p>
                        </button>

                        <button
                            className="flex flex-col justify-between items-center duration-300 hover:bg-base-300 py-4 px-2 rounded-md"
                            onClick={() => router.push('/subjects/upload')}
                        >
                            <img src='/icons/add_notes.svg' alt="" className="p-4" />
                            <p className="w-full">Add File</p>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
