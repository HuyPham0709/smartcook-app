import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Flag } from 'lucide-react';

export default function ModerationPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/reports')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (id: number) => {
    // Gọi API để cập nhật trạng thái
    await fetch(`http://localhost:5000/api/admin/reports/${id}/approve`, { method: 'POST' });
    setPosts(posts.filter(post => post.id !== id)); // Xóa khỏi danh sách sau khi duyệt
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      await fetch(`http://localhost:5000/api/admin/recipes/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading reports...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Giữ nguyên toàn bộ cấu trúc Card Render */}
         {posts.map((post: any) => (
           <div key={post.id} className="bg-white rounded-xl shadow-md ...">
             {/* Giữ nguyên CSS hiển thị title, author, reason... */}
             <button onClick={() => handleApprove(post.id)} className="...">Approve</button>
             <button onClick={() => handleDelete(post.id)} className="...">Delete</button>
           </div>
         ))}
      </div>
    </div>
  );
}