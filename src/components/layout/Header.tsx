import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { UserNav } from "@/components/layout/UserNav";
import { Stamp } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Stamp className="h-6 w-6" />
            <span className="inline-block font-bold">StampTrack</span>
          </Link>
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
