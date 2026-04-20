import { Link } from 'react-router-dom';
import { Users, FileText, TrendingUp, AlertCircle, Eye, Heart, MessageCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Total Users', value: '12,543', change: '+12.5%', icon: Users, color: '#7CBD92' },
  { title: 'Total Recipes', value: '3,421', change: '+8.2%', icon: FileText, color: '#FF8C42' },
  { title: 'Active Users (24h)', value: '1,832', change: '+5.3%', icon: TrendingUp, color: '#3B82F6' },
  { title: 'Flagged Posts', value: '23', change: '-15.2%', icon: AlertCircle, color: '#EF4444' },
];

const userGrowthData = [
  { month: 'Jan', users: 4000 },
  { month: 'Feb', users: 5200 },
  { month: 'Mar', users: 6800 },
  { month: 'Apr', users: 8100 },
  { month: 'May', users: 9500 },
  { month: 'Jun', users: 12543 },
];

const categoryData = [
  { name: 'Breakfast', value: 842, color: '#FF8C42' },
  { name: 'Lunch', value: 1234, color: '#7CBD92' },
  { name: 'Dinner', value: 987, color: '#3B82F6' },
  { name: 'Desserts', value: 358, color: '#EF4444' },
];

const topRecipes = [
  { id: 1, title: 'Fluffy Pancakes with Berries', author: 'Sarah Johnson', views: 12543, likes: 3421, comments: 234 },
  { id: 2, title: 'Healthy Buddha Bowl', author: 'Mike Chen', views: 9876, likes: 2156, comments: 189 },
  { id: 3, title: 'Decadent Chocolate Cake', author: 'Chef Marcus', views: 8765, likes: 1987, comments: 156 },
  { id: 4, title: 'Classic Pasta Carbonara', author: 'Isabella Romano', views: 7654, likes: 1654, comments: 143 },
  { id: 5, title: 'Grilled Salmon', author: 'Alex Kim', views: 6543, likes: 1432, comments: 98 },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and analytics</p>
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
          {stats.map((stat) => {
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
              <BarChart data={userGrowthData}>
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
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{recipe.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{recipe.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {recipe.views.toLocaleString()}
                      </div>
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
