"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Script from "next/script";
import { Lock, PlayCircle, Calendar, Clock, Globe, MessageCircle, Send, ShieldCheck, ChevronDown, ChevronUp, Download } from "lucide-react";

import { getCourseById } from "@/redux/slices/admin/courseSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import MentorSection from "@/components/public/MentorSection";

/* =======================
   Types & Interfaces
======================= */

interface CourseModule {
  title: string;
  zoomLink?: string;
  downloadLink?: string;
}

interface Student {
  user: { _id: string } | string;
  status: string;
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  price: number;
  salePrice: number;
  banner?: string;
  duration: string;
  timing: string;
  language: string;
  whatsAppLink?: string;
  telegramLink?: string;
  students?: Student[];
  modules?: CourseModule[];
}

// Razorpay specific handler types
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const CoursePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [openModule, setOpenModule] = useState<number | null>(null);

  // Memoizing fetch function to solve react-hooks/exhaustive-deps
  const fetchCourseData = useCallback(async () => {
    if (!id) return;
    const action = await dispatch(getCourseById({ id }));
    if (getCourseById.fulfilled.match(action)) {
      setCourse(action.payload as CourseData);
    }
  }, [dispatch, id]);

  const isEnrolled = course?.students?.some((s) => {
    const studentId = typeof s.user === 'object' ? s.user._id : s.user;
    return studentId?.toString() === user?.id?.toString() && s.status === "paid";
  });

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    if (isAuthenticated && user?.phone) {
      const cleanPhone = user.phone.replace(/^\+91/, "");
      setPhone(cleanPhone);
    }
  }, [isAuthenticated, user]);

  const toggleModule = (index: number) => {
    if (!isEnrolled) return;
    setOpenModule(openModule === index ? null : index);
  };

  const handleEnroll = async () => {
    if (!user) {
      alert("Please login first to enroll.");
      router.push("/login");
      return;
    }
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const finalPhone = phone.startsWith("+91") ? phone : `${countryCode}${phone}`;
      const { data: order } = await axios.post("/api/payment/create-order", {
        amount: course?.salePrice,
        courseId: course?._id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Course Platform",
        description: `Enrollment for ${course?.title}`,
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          try {
            await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course?._id,
              userId: user?.id,
              amount: course?.salePrice,
              phone: finalPhone,
            });
            alert("Payment Successful!");
            await fetchCourseData();
            window.location.reload(); 
          } catch {
            alert("Payment verification failed.");
          }
        },
        prefill: { name: user?.userName || "", email: user?.email || "", contact: finalPhone },
        theme: { color: "#2563eb" },
      };

      // @ts-expect-error Razorpay is loaded via external script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to start payment.");
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div className="p-20 text-center">Loading...</div>;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* HEADER & PAYMENT CARD */}
      <div className="bg-white rounded-2xl shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-10 border border-gray-100">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 text-lg">{course.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-600">₹{course.salePrice}</span>
            <span className="text-xl text-gray-400 line-through">₹{course.price}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 self-center">
          {isEnrolled ? (
            <div className="text-center space-y-4">
              <div className="bg-green-100 text-green-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <ShieldCheck size={20} /> You are enrolled
              </div>
              <button onClick={() => router.push('/dashboard/my-courses')} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition">
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center">Secure Enrollment</h3>
              <div className="flex gap-2">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="border rounded-lg px-2 bg-white outline-none font-bold">
                  <option value="+91">+91</option>
                </select>
                <input 
                  type="tel" placeholder="Phone Number" value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <button onClick={handleEnroll} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition">
                {loading ? "Processing..." : `Enroll & Pay ₹${course.salePrice}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DATA GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border shadow-xl rounded-2xl p-8 bg-white border-gray-100">
        <div className="text-center space-y-1">
          <Calendar className="mx-auto text-blue-600" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Start Date</p>
          <p className="text-lg font-bold text-gray-800">{course.banner || "TBA"}</p>
        </div>
        <div className="text-center space-y-1 border-l border-gray-100">
          <Clock className="mx-auto text-blue-600" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Duration</p>
          <p className="text-lg font-bold text-gray-800">{course.duration}</p>
        </div>
        <div className="text-center space-y-1 border-l border-gray-100">
          <Clock className="mx-auto text-blue-600" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Timing</p>
          <p className="text-lg font-bold text-gray-800">{course.timing}</p>
        </div>
        <div className="text-center space-y-1 border-l border-gray-100">
          <Globe className="mx-auto text-blue-600" size={24} />
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Language</p>
          <p className="text-lg font-bold text-gray-800">{course.language}</p>
        </div>
      </div>

      {/* COMMUNITY LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><MessageCircle size={24} /></div>
            <div>
              <p className="font-bold text-gray-800">WhatsApp Community</p>
              <p className="text-sm text-gray-500">Instant updates & support</p>
            </div>
          </div>
          {isEnrolled ? (
            <a href={course.whatsAppLink} target="_blank" rel="noreferrer" className="px-5 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">Join Now</a>
          ) : (
            <div className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1"><Lock size={12}/> Enroll to Unlock</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-500 rounded-xl"><Send size={24} /></div>
            <div>
              <p className="font-bold text-gray-800">Telegram Channel</p>
              <p className="text-sm text-gray-500">Exclusive study materials</p>
            </div>
          </div>
          {isEnrolled ? (
            <a href={course.telegramLink} target="_blank" rel="noreferrer" className="px-5 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm">Join Now</a>
          ) : (
            <div className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1"><Lock size={12}/> Enroll to Unlock</div>
          )}
        </div>
      </div>

      {/* CURRICULUM ACCORDION */}
      <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Course Curriculum</h2>
        <div className="space-y-4">
          {course.modules?.map((module, index) => {
            const isOpen = openModule === index;
            return (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-blue-100">
                <button 
                  onClick={() => toggleModule(index)}
                  className={`w-full p-6 flex items-center justify-between text-left transition-colors ${isEnrolled ? 'hover:bg-blue-50/50 cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full font-bold text-lg">
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-800 text-lg">{module.title}</span>
                  </div>
                  
                  {isEnrolled ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-bold uppercase">View Resources</span>
                      {isOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-sm font-bold flex items-center gap-1">
                      <Lock size={14} /> Enroll to Unlock
                    </span>
                  )}
                </button>

                {isOpen && isEnrolled && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {module.zoomLink ? (
                        <a href={module.zoomLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                          <PlayCircle size={20} /> Join Live Session
                        </a>
                      ) : (
                        <div className="py-3 text-center text-gray-400 text-sm border-2 border-dashed rounded-xl">No Live Session Link</div>
                      )}

                      {module.downloadLink ? (
                        <a href={module.downloadLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                          <Download size={20} /> Download Materials
                        </a>
                      ) : (
                        <div className="py-3 text-center text-gray-400 text-sm border-2 border-dashed rounded-xl">No Materials Available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MentorSection />
    </section>
  );
};

export default CoursePage;