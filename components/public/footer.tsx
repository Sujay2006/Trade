import Image from "next/image";
import Link from "next/link";
import { Instagram, Youtube, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Image src="/next.svg" alt="Logo" width={100} height={30} />
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering traders with professional price action strategies and psychological discipline.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-white rounded-lg text-gray-400 hover:text-blue-500 shadow-sm transition"><Instagram size={18}/></Link>
              <Link href="#" className="p-2 bg-white rounded-lg text-gray-400 hover:text-red-500 shadow-sm transition"><Youtube size={18}/></Link>
              <Link href="#" className="p-2 bg-white rounded-lg text-gray-400 hover:text-blue-400 shadow-sm transition"><Twitter size={18}/></Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/course" className="hover:text-black">All Courses</Link></li>
              <li><Link href="/blog" className="hover:text-black">Market Blogs</Link></li>
              <li><Link href="/mentor" className="hover:text-black">About Mentor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Contact</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Have questions? Reach out to us at:<br />
              <span className="text-black font-medium">support@tradingacademy.com</span>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Trading Academy. All rights reserved. Built for professional traders.
        </div>
      </div>
    </footer>
  );
}