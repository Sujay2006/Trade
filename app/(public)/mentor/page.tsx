import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function MentorPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-70 -z-10" />
          <Image 
            src="/mentor-full.jpg" 
            alt="Rohit Sharma" 
            width={500} 
            height={600} 
            className="rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 object-cover"
          />
          <div className="absolute bottom-10 -right-8 bg-black text-white p-6 rounded-3xl shadow-xl">
             <p className="text-3xl font-black italic">&quot;Trading is 10% strategy and 90% psychology.&quot;</p>
          </div>
        </div>

        <div className="space-y-8">
          <h1 className="text-5xl font-black text-gray-900 leading-tight">
            Meet <span className="text-[#0096FF]">Rohit Sharma</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            With over 7 years of aggressive market experience, Rohit has transitioned from a retail trader to a systematic institutional-style mentor.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <h4 className="text-2xl font-black text-gray-900">5,000+</h4>
              <p className="text-sm text-gray-500 font-bold uppercase">Students Mentored</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <h4 className="text-2xl font-black text-gray-900">7+ Years</h4>
              <p className="text-sm text-gray-500 font-bold uppercase">Market Experience</p>
            </div>
          </div>

          <div className="space-y-4">
            {["Certified Technical Analyst", "Options Greek Specialist", "Risk Management Expert"].map(item => (
              <div key={item} className="flex items-center gap-3 text-gray-700 font-semibold">
                <CheckCircle className="text-[#0096FF]" size={20} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
          <h2 className="text-3xl font-black">My Trading Philosophy</h2>
          <p className="text-gray-400 text-lg leading-loose italic">
            &quot;I don&apos;t teach you how to get rich overnight. I teach you how to read the language of the markets, manage your emotions, and protect your capital. The profits are simply a byproduct of good discipline.&quot;
          </p>
        </div>
      </section>
    </main>
  );
}