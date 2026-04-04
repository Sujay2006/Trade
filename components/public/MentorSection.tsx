import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function MentorSection() {
  return (
    <section className=" max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gray-900 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

        {/* Left: Mentor Image */}
        <div className="flex justify-center relative">
          <div className="relative z-10">
            <Image
              src="/default-avatar.jpg" 
              alt="Mentor"
              className="w-full max-w-[320px] aspect-[4/5] object-cover rounded-3xl shadow-2xl border-4 border-gray-800"
              width={320} 
              height={400}
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl hidden md:block">
               <p className="text-black font-black text-xl">7+ Years</p>
               <p className="text-gray-500 text-xs font-bold uppercase">Experience</p>
            </div>
          </div>
        </div>

        {/* Right: Mentor Details */}
        <div className="text-white space-y-6">
          <div>
            <h2 className="text-[#0096FF] font-bold uppercase tracking-widest text-sm mb-2">Lead Instructor</h2>
            <h3 className="text-4xl md:text-5xl font-black leading-tight">Meet Rohit Sharma</h3>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed">
            Rohit is a professional trader specializing in Options and Price Action. He has mentored over 5,000+ students to achieve financial independence through systematic trading.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Options Specialist",
              "Risk Management Expert",
              "7+ Years Experience",
              "Live Trading Sessions"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-gray-200">
                <CheckCircle2 size={20} className="text-[#0096FF]" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          <button className="bg-[#0096FF] hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-105">
             Explore Mentorship
          </button>
        </div>
      </div>
    </section>
  );
}