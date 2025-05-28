import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 text-center text-muted-foreground">
      <div className="container">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {APP_NAME}. Alle regte voorbehou.
        </p>
        <p className="text-xs mt-1">
          Ontwikkel vir kerk.co.za
        </p>
      </div>
    </footer>
  );
}
