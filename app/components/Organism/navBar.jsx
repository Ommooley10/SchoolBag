"use client";
import Link from "next/link";
import Image from "next/image";
import ShareUnselected from "../../../public/icons/share_unselected.svg";
import ShareSelected from "../../../public/icons/share_selected.svg";
import DashboardUnselected from "../../../public/icons/dashboard_unselected.svg";
import DashboardSelected from "../../../public/icons/dashboard_selected.svg";
import PeopleUnselected from "../../../public/icons/people_unselected.svg";
import PeopleSelected from "../../../public/icons/people_selected.svg";
import StarUnselected from "../../../public/icons/star_unselected.svg";
import StarSelected from "../../../public/icons/star_selected.svg";
import { useState } from "react";
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const currentPath = usePathname(); // Initialize useRouter
  console.log(currentPath);
  
  return (
    <>
      <nav className="px-6 py-4 bg-base-300 .box-shadow">
        <ul className="flex flex-row justify-between items-center">
          <Link href="/dashboard">
            <li className="flex justify-center items-center flex-col">
              <Image
                src={currentPath === "/dashboard" ? DashboardSelected : DashboardUnselected}
                alt="Dashboard"
              />
              <p className="caption-1 text-white">Dashboard</p>
            </li>
          </Link>
          <Link href="/share">
            <li className="flex justify-center items-center flex-col">
              <Image
                src={currentPath === "/share" ? ShareSelected : ShareUnselected}
                alt="Share"
              />
              <p className="caption-1 text-white">Shared</p>
            </li>
          </Link>
          <Link href="/starred">
            <li className="flex justify-center items-center flex-col">
              <Image
                src={currentPath === "/starred" ? StarSelected : StarUnselected}
                alt="Star"
              />
              <p className="caption-1 text-white">TalkToAI</p>
            </li>
          </Link>
          
        </ul>
      </nav>
    </>
  );
}
