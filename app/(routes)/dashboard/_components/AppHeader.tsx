import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const AppHeader = () => {
  const menuOptions = [
    { id: 1, name: "Home", path: "/" },
    { id: 2, name: "History", path: "/history" },
    { id: 3, name: "Pricing", path: "/pricing" },
    { id: 4, name: "Profile", path: "/profile" },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <Image src="/logo.svg" alt="logo" width={150} height={75} />
        
      </div>
      <nav className="hidden md:flex space-x-6">
        {menuOptions.map((option) => (
          <Link
            key={option.id}
            href={option.path}
            className="text-gray-600 hover:text-teal-700 hover:font-bold cursor-pointer text-base font-medium transition-colors"
          >
            {option.name}
          </Link>
        ))}
      </nav>
      <UserButton/>
     
    </header>
  );
};

export default AppHeader;
