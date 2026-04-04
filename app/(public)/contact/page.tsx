import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black text-gray-900">Get in Touch</h1>
        <p className="text-gray-500 font-medium">Have questions about a course? We&apos;re here to help.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-50 text-[#0096FF] rounded-2xl flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Email Us</h4>
              <p className="text-gray-500">support@tradingacademy.com</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">WhatsApp Support</h4>
              <p className="text-gray-500">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-gray-50 p-10 rounded-[3.5rem]">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Full Name</label>
              <input type="text" className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-[#0096FF] outline-none" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Email Address</label>
              <input type="email" className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-[#0096FF] outline-none" placeholder="john@example.com" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Message</label>
              <textarea rows={4} className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-[#0096FF] outline-none" placeholder="How can we help you?"></textarea>
            </div>
            <button className="md:col-span-2 bg-black text-white py-4 rounded-2xl font-black hover:bg-[#0096FF] transition-all">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}