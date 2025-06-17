import { useState } from 'react';
import { useTestConnectionQuery, useTestPostMutation, useRegisterMutation } from '../features/auth/authApi';

const TestPage = () => {
  const [testData, setTestData] = useState('');
  const [registerData, setRegisterData] = useState({
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123!'
  });

  const { data: connectionData, error: connectionError, isLoading: connectionLoading } = useTestConnectionQuery();
  const [testPost, { data: postData, error: postError, isLoading: postLoading }] = useTestPostMutation();
  const [register, { data: aregisterResult, error: registerError, isLoading: registerLoading }] = useRegisterMutation();

  const handleTestPost = () => {
    testPost({ testData });
  };

  const handleTestRegister = () => {
    register(registerData);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Диагностика соединения Frontend ↔ Backend</h1>

      {/* Тест GET запроса */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">GET Тест: /api/v1/test</h2>
        {connectionLoading && <p>Загрузка...</p>}
        {connectionError && (
          <div className="text-red-600">
            <p>Ошибка GET:</p>
            <pre className="text-sm bg-red-50 p-2 rounded">{JSON.stringify(connectionError, null, 2)}</pre>
          </div>
        )}
        {connectionData && (
          <div className="text-green-600">
            <p>Успешно!</p>
            <pre className="text-sm bg-green-50 p-2 rounded">{JSON.stringify(connectionData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Тест POST запроса */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">POST Тест: /api/v1/test-post</h2>
        <div className="mb-4">
          <input
            type="text"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            placeholder="Тестовые данные"
            className="border px-3 py-2 rounded mr-2"
          />
          <button
            onClick={handleTestPost}
            disabled={postLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {postLoading ? 'Отправка...' : 'Отправить POST'}
          </button>
        </div>
        {postError && (
          <div className="text-red-600">
            <p>Ошибка POST:</p>
            <pre className="text-sm bg-red-50 p-2 rounded">{JSON.stringify(postError, null, 2)}</pre>
          </div>
        )}
        {postData && (
          <div className="text-green-600">
            <p>Успешно!</p>
            <pre className="text-sm bg-green-50 p-2 rounded">{JSON.stringify(postData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Тест регистрации */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Тест регистрации: /api/v1/register</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={registerData.username}
            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
            placeholder="Username"
            className="border px-3 py-2 rounded"
          />
          <input
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
            placeholder="Email"
            className="border px-3 py-2 rounded"
          />
          <input
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
            placeholder="Password"
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          onClick={handleTestRegister}
          disabled={registerLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {registerLoading ? 'Регистрация...' : 'Тест регистрации'}
        </button>
        {registerError && (
          <div className="text-red-600 mt-4">
            <p>Ошибка регистрации:</p>
            <pre className="text-sm bg-red-50 p-2 rounded">{JSON.stringify(registerError, null, 2)}</pre>
          </div>
        )}
        {aregisterResult && (
          <div className="text-green-600 mt-4">
            <p>Успешно!</p>
            <pre className="text-sm bg-green-50 p-2 rounded">{JSON.stringify(aregisterResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
