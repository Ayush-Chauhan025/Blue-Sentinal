import Link from "next/link";
import { ArrowRight} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-screen flex flex-col font-sans">
      <header className="absolute top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-tight">
          <span>Blue Sentinel</span>
        </div>
        <Link 
          href="/login" 
          className="text-white bg-blue-800 rounded-lg p-2 font-semibold hover:bg-white hover:text-blue-800 transition-colors"
        >
          Sign In
        </Link>
      </header>

      <section className="relative grow flex items-center justify-center pt-20 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?q=80&w=2942&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Empowering Citizens. <br />
            <span className="text-blue-500">Protecting Communities.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the decentralized network for real-time hazard mapping and infrastructure reporting. Your voice keeps the city moving safely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/50"
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}