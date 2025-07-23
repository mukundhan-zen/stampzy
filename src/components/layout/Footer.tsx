export function Footer() {
  return (
    <footer className="flex items-center justify-center py-4 bg-background shadow-sm mt-auto">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} StampCollector. All rights reserved.
      </p>
    </footer>
  )
}
