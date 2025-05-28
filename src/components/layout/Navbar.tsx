import Link from 'next/link';
import { Home, PlusCircle, UserCog, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center text-sm sm:text-base">
              <Home className="mr-1 h-4 w-4 sm:mr-2" />
              Groepe
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
