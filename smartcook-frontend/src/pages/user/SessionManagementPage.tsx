import { Monitor, Smartphone, Tablet, MapPin, Calendar } from 'lucide-react';

const sessions = [
  {
    id: 1,
    device: 'Chrome on Windows',
    icon: Monitor,
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.1',
    lastActive: '2 minutes ago',
    isCurrent: true,
  },
  {
    id: 2,
    device: 'iPhone 13',
    icon: Smartphone,
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.5',
    lastActive: '1 hour ago',
    isCurrent: false,
  },
  {
    id: 3,
    device: 'Safari on iPad Pro',
    icon: Tablet,
    location: 'New York, NY',
    ipAddress: '10.0.0.12',
    lastActive: '2 days ago',
    isCurrent: false,
  },
  {
    id: 4,
    device: 'Firefox on MacOS',
    icon: Monitor,
    location: 'Los Angeles, CA',
    ipAddress: '172.16.0.8',
    lastActive: '1 week ago',
    isCurrent: false,
  },
];

export default function SessionManagementPage() {
  const handleLogout = (sessionId: number) => {
    console.log('Logging out session:', sessionId);
    // In production, this would call backend API
  };

  const handleLogoutAll = () => {
    console.log('Logging out all sessions');
    // In production, this would call backend API
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Sessions</h1>
          <p className="text-gray-600">Manage devices where you're currently logged in</p>
        </div>

        {/* Logout All Button */}
        <div className="mb-6">
          <button
            onClick={handleLogoutAll}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Log Out of All Devices
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => {
            const Icon = session.icon;
            
            return (
              <div
                key={session.id}
                className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
                  session.isCurrent ? 'ring-2 ring-[var(--green-medium)]' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: session.isCurrent ? 'var(--green-light)' : '#f3f4f6' }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: session.isCurrent ? 'white' : '#6b7280' }}
                      />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{session.device}</h3>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Last active {session.lastActive}</span>
                        </div>
                        <div className="text-xs text-gray-500">IP: {session.ipAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleLogout(session.id)}
                      className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• If you see an unfamiliar device, log out of that session immediately</li>
            <li>• Enable two-factor authentication for additional security</li>
            <li>• Regularly review your active sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
