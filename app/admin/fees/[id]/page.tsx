"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, ArrowLeft, Mail, Phone, User } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  courseId: string;
  status: string;
  date: string;
}

const FeeDetail = () => {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/fees').then(res => {
      const found = res.data.transactions.find((t: Transaction) => t.id === id);
      setTransaction(found);
      setLoading(false);
    });
  }, [id]);

 const handleRefund = async () => {
  if (!transaction) return; // ✅ fix

  if (!confirm("Confirm refund? This action is permanent.")) return;

  try {
    await axios.post(`/api/admin/fees/${id}`, {
      paymentId: transaction.id,
      amount: transaction.amount,
      courseId: transaction.courseId
    });

    alert("Refunded successfully");
    router.refresh();

  } catch (err) {
    console.error("Refund error:", err);
    alert("Refund failed");
  }
};
  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!transaction) return <div className="p-10 text-center">Transaction not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>

        {transaction.status === 'paid' && (
          <Button variant="destructive" onClick={handleRefund}>
            <RotateCcw className="mr-2 w-4 h-4" />
            Issue Refund
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Student Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            
            <div className="flex items-center gap-3">
              <User className="text-gray-400 w-5 h-5"/>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{transaction.studentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-gray-400 w-5 h-5"/>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{transaction.studentPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-gray-400 w-5 h-5"/>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{transaction.studentEmail}</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Course Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Enrollment & Payment
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-6">
            
            <div>
              <p className="text-xs text-gray-500">Course Title</p>
              <p className="text-xl font-bold">
                {transaction.courseTitle}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-xl font-bold text-green-600">
                ₹{transaction.amount}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Razorpay ID</p>
              <p className="text-sm font-mono text-gray-600">
                {transaction.id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default FeeDetail;