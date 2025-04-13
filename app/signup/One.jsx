import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../constants/firebase'; // Ensure these are correctly imported
import { getDatabase, ref, set } from 'firebase/database'; // Import functions for Realtime Database

const One = ({ onSuccessLogin }) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("User Info:", user);

      // Save user data to Realtime Database
      const db = getDatabase();
      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });

      onSuccessLogin(); 
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div className='grid'>
      <div
        className="flex mt-[25vh] justify-center gap-2 font-medium text-lg p-2 border border-white rounded-lg cursor-pointer transition-all duration-300 hover:bg-white hover:text-black transform hover:scale-105"
        onClick={handleGoogleLogin}
      >
        <img src="/img/login/main/google.svg" className="h-6" alt="Google Logo" />
        <p>Sign in using Google</p>
      </div>
    </div>
  );
};

export default One;
