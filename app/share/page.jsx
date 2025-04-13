'use client';
import { useEffect, useState } from 'react';
import { db, storage, auth } from '@/constants/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, onValue } from 'firebase/database';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import Topbar from '../components/Molecular/topbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SharePage() {
    const [sharedFiles, setSharedFiles] = useState([]);
    const [user, loading, error] = useAuthState(auth); // Firebase hook to get user state
    const router = useRouter();
    const userEmail = user?.email.replace(/\./g, ',');

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login'); // Redirect to login if not authenticated
            return;
        }
        if (!userEmail) return;

        const fetchSharedFiles = () => {
            const foldersRef = ref(db, 'folders');
            onValue(foldersRef, (snapshot) => {
                const foldersData = snapshot.val();
                const filesList = [];

                if (foldersData) {
                    Object.entries(foldersData).forEach(([userId, userFolders]) => {
                        Object.entries(userFolders).forEach(([folderId, folder]) => {
                            const files = folder.files || {};
                            Object.entries(files).forEach(([fileId, file]) => {
                                if (file.sharedWith && file.sharedWith[userEmail]) {
                                    const fileStorageRef = storageRef(storage, `files/${file.name}`);
                                    getDownloadURL(fileStorageRef).then((url) => {
                                        filesList.push({
                                            id: fileId,
                                            name: file.name,
                                            uploadedAt: file.uploadedAt,
                                            url,
                                            format: file.name.split('.').pop(),
                                            subject: folder.name,
                                            uploader: folder.email
                                        });
                                        setSharedFiles([...filesList]);
                                    }).catch((error) => console.error("Error fetching file URL:", error));
                                }
                            });
                        });
                    });
                } else {
                    console.log("No shared files found.");
                }
            });
        };

        fetchSharedFiles();
    }, [user, loading, userEmail, router]);

    if (loading) {
        return <p>Loading...</p>; // Show loading indicator while checking auth state
    }

    if (error) {
        return <p>Error: {error.message}</p>; // Display error message if there’s an auth error
    }

    return (
        <>
            <Topbar />
            <div className="h-screen flex flex-col">
                <div className="p-6">
                    <h1 className="text-3xl font-bold">Shared With Me</h1>
                    <p className="mt-4 text-lg">
                        Here you can access all the files that have been shared with you.
                    </p>
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold">Files</h2>
                        <ul className="list-disc mt-4 space-y-2">
                            {sharedFiles.length > 0 ? (
                                sharedFiles.map((file) => (
                                    <div
                                        className="flex flex-col gap-2 justify-between bg-base-400 rounded-md w-full py-4 px-4"
                                        key={file.id}
                                    >
                                        <div className="flex text-white items-center gap-2">
                                            <p
                                                className={`text-xs px-2 py-1 w-fit rounded-md text-white ${file.format === 'pdf' ? 'bg-red-500' :
                                                    file.format === 'ppt' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                            >
                                                {file.format.toUpperCase()}
                                            </p>
                                            <a href={file.url} className="truncate max-w-[8rem] text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                                {file.name}
                                            </a>
                                        </div>
                                        <div className="text-sm">
                                            <p>Uploader: {file.uploader}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <li>No files shared with you.</li>
                            )}
                        </ul>
                    </div>
                    <Link href={'/dashboard'} className='mt-5 text-blue-500 underline cursor-pointer'>Home &rarr;</Link>
                </div>
            </div>
        </>
    );
}
