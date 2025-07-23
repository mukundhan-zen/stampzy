import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/LogoutButton"

export async function Header() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <header className="bg-background px-4 lg:px-6 h-14 flex items-center shadow-sm">
      <Link href="/" className="flex items-center justify-center">
        <span className="font-semibold">StampCollector</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        {data.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline underline-offset-4 self-center"
            >
              Dashboard
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Button asChild variant="outline">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
