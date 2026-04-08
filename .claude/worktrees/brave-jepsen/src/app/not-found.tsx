import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl font-black text-[#0e59c3]/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-black mb-2">Page introuvable</h1>
        <p className="text-black/50 mb-8 max-w-sm">
          La page que tu cherches n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#0e59c3] text-white font-medium px-6 py-3 rounded-xl hover:bg-[#0d4fad] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
