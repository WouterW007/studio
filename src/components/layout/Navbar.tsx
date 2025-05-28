
import Link from 'next/link';
import Image from 'next/image';
import { Home, PlusCircle, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/kleingroepe-site.firebasestorage.app/o/baptiste-logo.png?alt=media&token=6de2241a-2f31-4c2d-8944-b224beac56a1"
            alt="Kerk Logo"
            width={125} // Adjusted for a 40px height based on original 218x70 ratio
            height={40}
            className="h-10 w-auto" // Use h-10 for height consistency, w-auto for aspect ratio
            priority // Preload logo as it's LCP
          />
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center text-sm sm:text-base">
              <Home className="mr-1 h-4 w-4 sm:mr-2" />
              Kleingroepe
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/register" className="flex items-center text-sm sm:text-base">
              <PlusCircle className="mr-1 h-4 w-4 sm:mr-2" />
              Registreer Groep
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin" className="flex items-center text-sm sm:text-base">
              <UserCog className="mr-1 h-4 w-4 sm:mr-2" />
              Admin
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
