import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const trendingKeywords = [
  {
    id: 1,
    keyword: 'món ăn hàng ngày',
    translation: 'everyday meals',
    image: 'https://images.unsplash.com/photo-1677653805080-59c57727c84e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzY0NTM3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    keyword: 'bánh ngọt đơn giản',
    translation: 'simple desserts',
    image: 'https://images.unsplash.com/photo-1772198537593-01eafb35efa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW1wbGUlMjBkZXNzZXJ0JTIwcGFzdHJ5fGVufDF8fHx8MTc3NjQ1MzczMXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    keyword: 'thịt ba chỉ',
    translation: 'pork belly',
    image: 'https://images.unsplash.com/photo-1762305193367-91e072e47c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3JrJTIwYmVsbHklMjBtZWF0JTIwZGlzaHxlbnwxfHx8fDE3NzY0NTM3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    keyword: 'bữa sáng nhanh',
    translation: 'quick breakfast',
    image: 'https://images.unsplash.com/photo-1609158087148-3bae840bcfda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjB0b2FzdCUyMGF2b2NhZG98ZW58MXx8fHwxNzc2NDUzNzQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    keyword: 'cơm hộp tiện lợi',
    translation: 'meal prep bowls',
    image: 'https://images.unsplash.com/photo-1666819691716-827f78d892f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBib3dsc3xlbnwxfHx8fDE3NzY0NTM3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    keyword: 'pasta ý',
    translation: 'italian pasta',
    image: 'https://images.unsplash.com/photo-1662478839788-7d2898ca66cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMHRvbWF0byUyMGJhc2lsfGVufDF8fHx8MTc3NjIxNzgwMXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export default function TrendingKeywords() {
  const currentTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Từ Khóa Thịnh Hành</h2>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Cập nhật {currentTime}</span>
        </div>
      </div>

      {/* Grid of Trending Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingKeywords.map((item) => (
          <Link
            key={item.id}
            to={`/search?q=${encodeURIComponent(item.translation)}`}
            className="group relative aspect-[16/9] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.keyword}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">
                {item.keyword}
              </h3>
              <p className="text-white/80 text-xs mt-0.5">{item.translation}</p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors duration-300"></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
