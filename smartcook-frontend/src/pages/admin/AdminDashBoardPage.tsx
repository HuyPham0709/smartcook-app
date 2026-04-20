import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, TrendingUp, AlertCircle, Eye, Heart, MessageCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  // 1. Thêm State để lưu khoảng thời gian lọc (Mặc định 30 ngày)
  const [timeRange, setTimeRange] = useState('30d');

  // State lưu trữ dữ liệu từ API bao gồm cả data cho 2 biểu đồ
  const [data, setData] = useState<any>({
    stats: { totalUsers: 0, totalRecipes: 0, activeUsers: 0, flaggedPosts: 0 },
    topRecipes: [],
    userGrowth: [],
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  // 2. Thêm timeRange vào dependency array và query string
  useEffect(() => {
    setLoading(true);
    // Gọi API lấy dữ liệu thực tế từ SQL Server kèm theo bộ lọc
    fetch(`http://localhost:3000/api/admin/dashboard?range=${timeRange}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối API Dashboard:", err);
        setLoading(false);
      });
  }, [timeRange]);

  // 3. Map lại dữ liệu: Dùng fallback (??) để code không bị lỗi gãy UI 
  // nếu Backend trả về cấu trúc mới (chứa value & change) hoặc vẫn giữ cấu trúc cũ (chỉ có số)
  const statsDisplay = [
    { 
      title: 'Total Users', 
      value: (data.stats?.totalUsers?.value ?? data.stats?.totalUsers ?? 0).toLocaleString(), 
      change: data.stats?.totalUsers?.change || '+0%', 
      icon: Users, 
      color: '#7CBD92' 
    },
    { 
      title: 'Total Recipes', 
      value: (data.stats?.totalRecipes?.value ?? data.stats?.totalRecipes ?? 0).toLocaleString(), 
      change: data.stats?.totalRecipes?.change || '+0%', 
      icon: FileText, 
      color: '#FF8C42' 
    },
    { 
      title: 'Active Users', 
      value: (data.stats?.activeUsers?.value ?? data.stats?.activeUsers ?? 0).toLocaleString(), 
      change: data.stats?.activeUsers?.change || '+0%', 
      icon: TrendingUp, 
      color: '#3B82F6' 
    },
    { 
      title: 'Flagged Posts', 
      value: (data.stats?.flaggedPosts?.value ?? data.stats?.flaggedPosts ?? 0).toString(), 
      change: data.stats?.flaggedPosts?.change || '0%', 
      icon: AlertCircle, 
      color: '#EF4444' 
    },
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center text-xl">Đang tải dữ liệu Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Thêm thẻ div bọc ngoài để chứa Dropdown */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform overview and analytics</p>
          </div>
          
          {/* Dropdown Lọc Thời Gian (CSS được mượn từ nút bấm của bạn ở dưới) */}
          <select
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:border-[var(--orange)] transition-colors cursor-pointer"
            aria-label="Select time range for dashboard data"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="1y">This year</option>
          </select>
        </div>

        {/* Quick Links */}
        <div className="flex gap-4 mb-8">
          <Link
            to="/admin/moderation"
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-[var(--orange)] transition-colors"
          >
            Moderation Queue
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-[var(--green-medium)] transition-colors"
          >
            Audit Logs
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  {/* GIỮ NGUYÊN CSS LOGIC MÀU SẮC CỦA BẠN */}
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#7CBD92" name="Total Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recipe Categories Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recipe Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Recipes Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top Performing Recipes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topRecipes?.map((recipe: any) => (
                  <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{recipe.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{recipe.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-red-500" />
                        {recipe.likes.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        {recipe.comments}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}