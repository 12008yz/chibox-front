import React, { useState } from 'react';
import {
  // Auth API
  useTestConnectionQuery,
  useTestPostMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,

  // Cases API
  useGetCaseTemplatesQuery,
  useGetUserCasesQuery,
  useBuyCaseMutation,
  useOpenCaseMutation,
  useGetCasePurchaseInfoQuery,

  // User API
  useGetUserBalanceQuery,
  useGetUserInventoryQuery,
  useSellItemMutation,
  useWithdrawItemMutation,
  useGetUserAchievementsQuery,
  useGetAchievementsProgressQuery,
  useGetUserMissionsQuery,
  useGetUserNotificationsQuery,
  useGetUserTransactionsQuery,
  useGetUserStatisticsQuery,
  useGetUserSubscriptionQuery,
  useApplyPromoCodeMutation,
  useDepositBalanceMutation,
  useWithdrawBalanceMutation,
  useGetLeaderboardQuery,
  useGetBonusStatusQuery,
  usePlayBonusSquaresMutation,
  useBuySubscriptionMutation,
  useExchangeItemForSubscriptionMutation,
  useGetBonusInfoQuery,
  useSteamBotLoginMutation,
  useSendSteamTradeMutation,
  useGetSteamInventoryQuery,
  useGetPublicProfileQuery,
  useGetWithdrawalStatusQuery,

} from '../features';

interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
}

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  // Test queries
  const { data: testConnection, error: testError } = useTestConnectionQuery();
  const { data: currentUser, error: userError } = useGetCurrentUserQuery();
  const { data: userBalance } = useGetUserBalanceQuery();
  const { data: caseTemplates } = useGetCaseTemplatesQuery();
  const { data: userInventory } = useGetUserInventoryQuery({});
  const { data: achievements } = useGetUserAchievementsQuery();
  const { data: missions } = useGetUserMissionsQuery();
  const { data: statistics } = useGetUserStatisticsQuery();
  const { data: subscription } = useGetUserSubscriptionQuery();
  const { data: leaderboard } = useGetLeaderboardQuery({});
  const { data: bonusStatus } = useGetBonusStatusQuery();
  const { data: bonusInfo } = useGetBonusInfoQuery();

  // Test mutations
  const [testPost] = useTestPostMutation();
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [logout] = useLogoutMutation();
  const [buyCase] = useBuyCaseMutation();
  const [openCase] = useOpenCaseMutation();
  const [sellItem] = useSellItemMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [deposit] = useDepositBalanceMutation();
  const [playBonus] = usePlayBonusSquaresMutation();

  const testEndpoint = async (name: string, fn: () => Promise<any>) => {
    setLoading(name);
    try {
      const result = await fn();
      setTestResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [name]: { success: false, error } }));
    } finally {
      setLoading(null);
    }
  };

  const testMutations = () => {
    // Test POST endpoint
    testEndpoint('testPost', () => testPost({ testData: 'Hello from frontend!' }).unwrap());
  };

  const testLogin = () => {
    testEndpoint('login', () =>
      login({
        email: 'test@example.com',
        password: 'password123'
      }).unwrap()
    );
  };

  const testRegister = () => {
    testEndpoint('register', () =>
      register({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123'
      }).unwrap()
    );
  };

  const testBuyCase = () => {
    if (caseTemplates!.data.length > 0) {
      testEndpoint('buyCase', () =>
        buyCase({ case_template_id: caseTemplates!.data[0].id }).unwrap()
      );
    }
  };

  const testApplyPromo = () => {
    testEndpoint('applyPromo', () =>
      applyPromo({ promo_code: 'TEST2024' }).unwrap()
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ChiBox API Test Page</h1>

      {/* Connection Status */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Test Connection</h3>
            {testConnection ? (
              <pre className="text-green-600 text-sm">
                {JSON.stringify(testConnection, null, 2)}
              </pre>
            ) : testError ? (
              <pre className="text-red-600 text-sm">
                {JSON.stringify(testError, null, 2)}
              </pre>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Current User</h3>
            {currentUser ? (
              <pre className="text-green-600 text-sm">
                {JSON.stringify(currentUser, null, 2)}
              </pre>
            ) : userError ? (
              <pre className="text-red-600 text-sm">
                {JSON.stringify(userError, null, 2)}
              </pre>
            ) : (
              <p>Not authenticated</p>
            )}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Endpoints</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={testMutations}
            disabled={loading === 'testPost'}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading === 'testPost' ? 'Testing...' : 'Test POST'}
          </button>

          <button
            onClick={testLogin}
            disabled={loading === 'login'}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading === 'login' ? 'Testing...' : 'Test Login'}
          </button>

          <button
            onClick={testRegister}
            disabled={loading === 'register'}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            {loading === 'register' ? 'Testing...' : 'Test Register'}
          </button>

          <button
            onClick={testBuyCase}
            disabled={loading === 'buyCase' || !caseTemplates?.data?.length}
            className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
          >
            {loading === 'buyCase' ? 'Testing...' : 'Test Buy Case'}
          </button>

          <button
            onClick={testApplyPromo}
            disabled={loading === 'applyPromo'}
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
          >
            {loading === 'applyPromo' ? 'Testing...' : 'Test Promo Code'}
          </button>
        </div>
      </div>

      {/* Query Results */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Query Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">User Balance</h3>
            <pre className="text-sm">{JSON.stringify(userBalance, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Case Templates</h3>
            <pre className="text-sm">{JSON.stringify(caseTemplates, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">User Inventory</h3>
            <pre className="text-sm">{JSON.stringify(userInventory, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Achievements</h3>
            <pre className="text-sm">{JSON.stringify(achievements, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Missions</h3>
            <pre className="text-sm">{JSON.stringify(missions, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Statistics</h3>
            <pre className="text-sm">{JSON.stringify(statistics, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Subscription</h3>
            <pre className="text-sm">{JSON.stringify(subscription, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Leaderboard</h3>
            <pre className="text-sm">{JSON.stringify(leaderboard, null, 2)}</pre>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Bonus Status</h3>
            <pre className="text-sm">{JSON.stringify(bonusStatus, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {Object.entries(testResults).map(([name, result]: [string, any]) => (
              <div key={name} className="p-4 border rounded">
                <h3 className="font-semibold">{name}</h3>
                <pre className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTestPage;
