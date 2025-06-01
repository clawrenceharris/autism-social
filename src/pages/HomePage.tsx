export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Scenario Builder</h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome to the Scenario Builder. Create and manage interactive dialogue scenarios compatible with XState.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Scenario</h2>
          <p className="text-gray-600 mb-4">
            Start building a new interactive dialogue scenario from scratch.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Scenarios</h2>
          <p className="text-gray-600 mb-4">
            View, edit, and organize your existing scenarios.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600 mb-4">
            Configure your preferences and manage your account.
          </p>
        </div>
      </div>
    </div>
  );
}