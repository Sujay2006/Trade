"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Search, Trash2 } from 'lucide-react'; // Added Trash2 icon
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';

const FeeManagement = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFees = () => {
    setLoading(true);
    axios.get('/api/admin/fees').then(res => {
      setData(res.data);
      console.log(res.data);
      
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // NEW: Delete Handler
 const handleDelete = async (paymentId: string, courseId: string, amount: number) => {
  if (!confirm("This will permanently remove the student's access and update revenue. Continue?")) return;

  try {
    // Calling the dynamic [id].ts route using DELETE method
    await axios.delete(`/api/admin/fees/${paymentId}`, {
      params: { 
        courseId: courseId, 
        amount: amount 
      }
    });

    alert("Deleted successfully");
    fetchFees(); // Refresh the table
  } catch (error: any) {
    console.error(error);
    alert(error.response?.data?.message || "Failed to delete");
  }
};
  const filtered = data?.transactions?.filter((t: any) =>
    t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.studentPhone.includes(searchTerm)
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name or phone..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardHeader><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-700">₹{data?.totalFees}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Monthly Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{data?.monthlyFees}</div></CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : (
              filtered.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.studentName}</TableCell>
                  <TableCell>{t.studentPhone}</TableCell>
                  <TableCell>{t.courseTitle}</TableCell>
                  <TableCell>₹{t.amount}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${t.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/fees/${t.id}`)}>
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(t.id, t.courseId, t.amount)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
export default FeeManagement;