'use client'

import { useTransition } from "react"
import { logout } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      logout()
    })
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  )
}
