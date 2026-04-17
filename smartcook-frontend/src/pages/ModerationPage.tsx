import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Flag } from 'lucide-react';

interface FlaggedPost {
  id: number;
  recipeTitle: string;
  recipeImage: string;
  author: string;
  flaggedBy: string;
  reason: string;
  flaggedAt: string;
  description: string;
}

const flaggedPosts: FlaggedPost[] = [
  {
    id: 1,
    recipeTitle: 'Questionable Food Recipe',
    recipeImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    author: 'Unknown User',
    flaggedBy: 'JohnDoe23',
    reason: 'Inappropriate Content',
    flaggedAt: '2 hours ago',
    description: 'Contains potentially harmful cooking instructions',
  },
  {
    id: 2,
    recipeTitle: 'Spam Recipe Post',
    recipeImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    author: 'SpamBot99',
    flaggedBy: 'Admin',
    reason: 'Spam',
    flaggedAt: '5 hours ago',
    description: 'Multiple users reported this as spam content',
  },
  {
    id: 3,
    recipeTitle: 'Copied Recipe',
    recipeImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    author: 'FakeChef',
    flaggedBy: 'OriginalAuthor',
    reason: 'Copyright Violation',
    flaggedAt: '1 day ago',
    description: 'Recipe copied from another platform without permission',
  },
  {
    id: 4,
    recipeTitle: 'Misleading Title',
    recipeImage: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400',
    author: 'ClickBait',
    flaggedBy: 'SarahK',
    reason: 'Misleading Information',
    flaggedAt: '2 days ago',
    description: 'Title and content do not match',
  },
];

export default function ModerationPage() {
  const [posts, setPosts] = useState(flaggedPosts);

  const handleApprove = (id: number) => {
    setPosts(posts.filter((post) => post.id !== id));
    // In production, this would call backend API
    console.log('Approved post:', id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setPosts(posts.filter((post) => post.id !== id));
      // In production, this would call backend API
      console.log('Deleted post:', id);
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Inappropriate Content':
        return 'bg-red-100 text-red-800';
      case 'Spam':
        return 'bg-orange-100 text-orange-800';
      case 'Copyright Violation':
        return 'bg-purple-100 text-purple-800';
      case 'Misleading Information':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                Approve All Safe
              </button>
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                Bulk Delete
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
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={post.recipeImage}
                        alt={post.recipeTitle}
                        className="w-48 h-36 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{post.recipeTitle}</h3>
                          <p className="text-sm text-gray-600">
                            By <span className="font-medium">{post.author}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(post.reason)}`}>
                          {post.reason}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
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
                          onClick={() => handleApprove(post.id)}
                          className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
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
    </div>
  );
}
