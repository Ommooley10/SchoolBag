"use client";
import { useState } from "react";
import One from "./One";
import Two from "./Two"; // Ensure you import the Two component
import Link from "next/link";

const Page = () => {
  const [pageNo, setPageNo] = useState(1);

  const nextPage = () => {
    setPageNo((prevPageNo) => prevPageNo + 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden bg-background">
      <div className="lg:w-1/5 md:w-1/2 mx-auto text-white">
        <div className="space-y-4 py-5 px-5">
          <p className="text-3xl">Sign up</p>
          <div className="grid w-full grid-cols-2 gap-2">
            <div
              className={`w-full rounded-full ${
                pageNo >= 1 ? "bg-brand-primary-200" : "bg-[#393939]"
              } h-1`}
            ></div>
            <div
              className={`w-full rounded-full ${
                pageNo >= 2 ? "bg-brand-primary-200" : "bg-[#393939]"
              } h-1`}
            ></div>
          </div>
          {/* Conditionally render components based on the pageNo */}
          <div>{pageNo === 1 && <One onSuccessLogin={() => setPageNo(2)} />}</div>
          <div>{pageNo === 2 && <Two />}</div>
        </div>
      </div>
    </div>
  );
};

export default Page;
