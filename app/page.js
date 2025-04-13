import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <div className='grid place-content-center h-screen text-white'>
      <Link href="/login">
        <button>Login</button>
      </Link>

      <Link href="/signup">
        <button>Signup</button>
      </Link>
    </div>
  )
}

export default page