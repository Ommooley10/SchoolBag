'use client'; // Make sure to specify this at the top
import { useState } from "react";
import { auth } from "../../constants/firebase"; // Import your Firebase config
import { getDatabase, ref, set } from "firebase/database"; // Import necessary database functions
import { IoInformationCircleOutline } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const Two = () => {
  const [bagName, setBagName] = useState(''); // State for the backpack name
  const router = useRouter(); // Initialize useRouter

  const handleSaveBagName = async () => {
    const user = auth.currentUser; // Get the currently logged-in user
    if (user) {
      try {
        const db = getDatabase();
        await set(ref(db, 'users/' + user.uid + '/backpackName'), { // Removed the extra space in the path
          bagName: bagName,
        });
        console.log("Backpack name saved:", bagName);
        setBagName(''); // Reset the input

        // Redirect to /dashboard after saving
        router.push('/dashboard'); // Navigate to the dashboard
      } catch (error) {
        console.error("Error saving backpack name:", error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  return (
    <div className="py-4">
      <div className="space-y-4 flex justify-between flex-col">
        <div className="space-y-4">
          <p className="text-2xl font-medium">Let's create your bag</p>
          <p className="text-xs font-light">
            Bags are your personal filing cabinets within the app.
            <br /> Organize your files by topic, or any way that works best for
            you. Everything you store in your Bags stays readily accessible on
            your device, even when you're offline.
          </p>

          <p className="text-xl">Name your very own bag</p>
          <input
            type="text"
            value={bagName} // Bind the input value to state
            onChange={(e) => setBagName(e.target.value)} // Update state on input change
            className="bg-transparent border placeholder:text-xs border-white w-full rounded-md py-1 px-3"
            placeholder="Enter School Email"
          />
          <div className="w-full bg-[#002241] flex gap-1 p-2 rounded-lg items-center justify-evenly">
            <IoInformationCircleOutline className="text-[#1D90FA] text-4xl" />
            <p className="text-[#1D90FA] text-xs p-1">
              The bag name will be displayed alongside files when you share them.
            </p>
          </div>
        </div>

        <div className="text-center py-5 px-5 mx-auto flex flex-col items-center gap-4 text-xl w-full">
          <button
            className="w-full text-black bg-brand-primary-200 rounded-md font-medium py-2"
            onClick={handleSaveBagName}
          >
            Next &rarr;
          </button>
          <Link href="/login">
            <button className="w-full underline text-white text-sm">Cancel</button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Two;
