import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Flag, ShieldAlert } from 'lucide-react';

interface FlaggedPost {
  id: number;
  recipeTitle: string;
  recipeImage: string;
  author: string;
  authorId: number;
  flaggedBy: string;
  source: 'AI' | 'User'; 
  reason: string;
  flaggedAt: string;
  description: string;
}

export default function ModerationPage() {
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho Bulk Actions (Lưu trữ các ID đang được chọn)
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // State cho Modal Xóa & Cảnh cáo
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'delete' | null;
    postId: number | null;
    authorId: number | null;
  }>({ isOpen: false, action: null, postId: null, authorId: null });

  // State cho tuỳ chọn xử phạt trong Modal
  const [penalty, setPenalty] = useState({ warn: false, banDays: 0 });

  // GỌI API THỰC TẾ TỪ NODEJS
  const fetchPosts = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/admin/moderation')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setSelectedPosts([]); // Reset selection khi load lại
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối API Moderation:", err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchPosts(); }, []);

  const triggerAction = (id: number, authorId: number, action: 'approve' | 'delete') => {
    setConfirmModal({ isOpen: true, action, postId: id, authorId });
    setPenalty({ warn: false, banDays: 0 }); 
  };

  // GỌI API THỰC TẾ ĐỂ XỬ LÝ
  const executeAction = () => {
    fetch('http://localhost:3000/api/admin/moderation/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: confirmModal.postId,
        action: confirmModal.action,
        authorId: confirmModal.authorId,
        warnUser: penalty.warn,
        banUserDays: penalty.banDays,
        adminId: 1 // Giả lập Admin ID
      })
    })
    .then(() => {
      setConfirmModal({ isOpen: false, action: null, postId: null, authorId: null });
      fetchPosts(); // Load lại data từ DB sau khi xử lý
    })
    .catch(err => console.error("Lỗi xử lý:", err));
  };

  const executeBulkAction = (action: 'approve' | 'delete') => {
    if (selectedPosts.length === 0) return alert("Vui lòng chọn ít nhất 1 báo cáo!");
    
    fetch('http://localhost:3000/api/admin/moderation/bulk', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIds: selectedPosts, action, adminId: 1 })
    })
    .then(() => fetchPosts())
    .catch(err => console.error("Lỗi xử lý hàng loạt:", err));
  };

  const toggleSelectOne = (id: number) => {
    if (selectedPosts.includes(id)) setSelectedPosts(selectedPosts.filter(pid => pid !== id));
    else setSelectedPosts([...selectedPosts, id]);
  };

  const getReasonColor = (reason: string) => {
    if (!reason) return 'bg-gray-100 text-gray-800';
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('inappropriate')) return 'bg-red-100 text-red-800';
    if (lowerReason.includes('spam')) return 'bg-orange-100 text-orange-800';
    if (lowerReason.includes('copyright')) return 'bg-purple-100 text-purple-800';
    if (lowerReason.includes('misleading')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center text-gray-500">Đang tải danh sách chờ duyệt từ Database...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          </div>
          <p className="text-gray-600">Review and moderate flagged content</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-sm text-gray-600">Posts Pending Review</div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => executeBulkAction('approve')}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Approve All Selected
              </button>
              <button 
                onClick={() => executeBulkAction('delete')}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>

        {/* Flagged Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">All Clear!</h2>
            <p className="text-gray-600">No flagged posts to review at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex gap-6">
                    {/* Checkbox */}
                    <div className="pt-2">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 cursor-pointer accent-[var(--orange)] rounded"
                        aria-label={`Select post ${post.recipeTitle} for bulk action`}
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => toggleSelectOne(post.id)}
                      />
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={post.recipeImage}
                        alt={post.recipeTitle}
                        className="w-48 h-36 object-cover rounded-lg shadow-sm"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">{post.recipeTitle}</h3>
                            {post.source === 'AI' ? (
                              <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                                <ShieldAlert className="w-3 h-3" /> AI Flagged
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                <Flag className="w-3 h-3" /> User Flagged
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            By <span className="font-medium">{post.author}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(post.reason)}`}>
                          {post.reason}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Flagged by: {post.flaggedBy}</span>
                          <span className="text-xs text-gray-500">• {post.flaggedAt}</span>
                        </div>
                        <p className="text-sm text-gray-700">{post.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => triggerAction(post.id, post.authorId, 'approve')}
                          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-sm hover:shadow"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => triggerAction(post.id, post.authorId, 'delete')}
                          className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm hover:shadow"
                        >
                          <XCircle className="w-4 h-4" />
                          Delete
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4" />
                          View Full Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CUSTOM CONFIRM MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              {confirmModal.action === 'delete' ? (
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <AlertTriangle className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <CheckCircle className="w-10 h-10" />
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {confirmModal.action === 'delete' ? 'Xóa bài viết vi phạm?' : 'Duyệt bài viết này?'}
              </h3>
              
              <p className="text-gray-500 mb-6 leading-relaxed">
                {confirmModal.action === 'delete'
                  ? 'Hành động này sẽ xóa bài viết khỏi nền tảng và đánh dấu báo cáo là đã giải quyết. Bạn có muốn áp dụng hình phạt bổ sung?'
                  : 'Bài viết này sẽ được đánh dấu là an toàn, báo cáo sẽ bị bác bỏ và bài viết vẫn tiếp tục hiển thị.'}
              </p>

              {/* TUỲ CHỌN XỬ PHẠT (Chỉ hiện khi chọn Xóa) */}
              {confirmModal.action === 'delete' && (
                <div className="bg-gray-50 p-4 rounded-xl mb-6 w-full text-left border border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-red-500"
                      checked={penalty.warn}
                      onChange={(e) => setPenalty({...penalty, warn: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-gray-700">Gửi cảnh cáo đến người dùng (Warn)</span>
                  </label>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Khóa tài khoản (Ban):</span>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                      aria-label="Select ban duration for the user"
                      value={penalty.banDays}
                      onChange={(e) => setPenalty({...penalty, banDays: parseInt(e.target.value)})}
                    >
                      <option value={0}>Không khóa</option>
                      <option value={3}>Khóa 3 ngày</option>
                      <option value={7}>Khóa 7 ngày</option>
                      <option value={30}>Khóa 30 ngày</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, action: null, postId: null, authorId: null })}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-100 outline-none"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 py-3 px-4 font-semibold rounded-xl text-white transition-all shadow-md hover:shadow-lg focus:ring-4 outline-none ${
                    confirmModal.action === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600 focus:ring-red-200' 
                      : 'bg-green-500 hover:bg-green-600 focus:ring-green-200'
                  }`}
                >
                  {confirmModal.action === 'delete' ? 'Xác nhận Xóa' : 'Xác nhận Duyệt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}