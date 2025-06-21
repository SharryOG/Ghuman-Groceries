import React, { useEffect, useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import { db } from './services/database';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.initialize();
        setDbReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError('Failed to initialize database. Please refresh the page.');
      }
    };

    initializeDatabase();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Database Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Initializing Database</h2>
              <p className="text-gray-600">Setting up SQLite database...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MainLayout />;
}

export default App;