
import Link from 'next/link';
import { Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background text-foreground/80 py-12 border-t border-border/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Volg Ons */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Volg Ons</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-foreground/80 hover:text-foreground transition-colors">
                <Facebook size={28} />
              </Link>
              <Link href="#" aria-label="YouTube" className="text-foreground/80 hover:text-foreground transition-colors">
                <Youtube size={28} />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-foreground/80 hover:text-foreground transition-colors">
                <Instagram size={28} />
              </Link>
            </div>
          </div>

          {/* Column 2: Dienste */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Dienste</h3>
            <ul className="space-y-2 text-sm">
              <li>Sondag Oggend</li>
              <li className="ml-2">08:30 en 10:15</li>
              <li>Sondag Aand</li>
              <li className="ml-2">18:30</li>
            </ul>
          </div>

          {/* Column 3: Kontak Inligting */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Kontak Inligting</h3>
            <ul className="space-y-2 text-sm">
              <li>Tel: 051 451 1017</li>
              <li>
                E-pos: <Link href="mailto:kerk@kerk.co.za" className="hover:text-foreground hover:underline">kerk@kerk.co.za</Link>
              </li>
              <li>Kantoor Ure: Maandae - Vrydae, 08:15-13:00</li>
              <li>1 Van Blerklaan, Spitskop, Bloemfontein</li>
            </ul>
          </div>

          {/* Column 4: Bank Besonderhede */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Bank Besonderhede</h3>
            <ul className="space-y-2 text-sm">
              <li>BFN Baptiste Kerk</li>
              <li>ABSA Bank</li>
              <li>Tjek Rekening</li>
              <li>470207655</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <Link href="#" className="text-foreground/60 hover:text-foreground hover:underline transition-colors mb-4 sm:mb-0">
            Rapporteer Website Foute
          </Link>
          <p className="text-xs text-foreground/60">
            &copy; {new Date().getFullYear()} kerk.co.za. Alle regte voorbehou.
          </p>
        </div>
      </div>
    </footer>
  );
}
