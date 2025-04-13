'use client'; // Ensure this is specified at the top since you are using hooks
import { useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "../../../constants/firebase"; // Import your Firebase config
import { getDatabase, ref, onValue } from "firebase/database"; // Import necessary database functions
import Infoicon from "../../../public/img/svgs/Info.svg";

export default function Topbar() {
  const [bagName, setBagName] = useState(''); // State for the bag name
  const [profilePic, setProfilePic] = useState(''); // State for the user's profile picture

  useEffect(() => {
    const user = auth.currentUser; 
    console.log(user);
    // Get the currently logged-in user
    if (user) {
      const db = getDatabase();
      const bagNameRef = ref(db, `users/${user.uid}/backpackName/bagName`);

      // Listen for changes to the bag name in the database
      onValue(bagNameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setBagName(data); // Set the bag name directly if it's stored as a string
        } else {
          setBagName(''); // Set to empty if no data is found
        }
      });

      // Set user's profile picture
      setProfilePic(user.photoURL || '/img/defaultProfilePic.png'); // Use a default image if photoURL is not available
    }
  }, []);

  return (
    <div className="border-b-2 border-base-100 p-4 flex justify-between items-center">
      <img src={profilePic} className="rounded-full w-8 h-8" alt="User Profile" />
      <p className="title-2 text-white">{bagName || "Your Bag"}</p> {/* Display the bag name or a default message */}
      <a href="">
        <Image src={Infoicon} alt="Info Icon" width={32} height={32} className="rounded-full" />
      </a>
    </div>
  );
}
