import React, { useState } from 'react';
import { signIn, confirmSignIn } from 'aws-amplify/auth';

const Login: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'SIGN_IN' | 'CONFIRM_NEW_PASSWORD'>('SIGN_IN');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const signInResult = await signIn({ username, password });
      console.log('Login.tsx: signIn successful, result:', signInResult);

      if (signInResult.nextStep && signInResult.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setCurrentStep('CONFIRM_NEW_PASSWORD');
        setError(null); // Clear previous login errors
      } else if (signInResult.isSignedIn) {
        // This case should ideally be handled by the Hub listener in App.tsx
        // but we can log it here for completeness if needed.
        console.log('Login.tsx: User is signed in directly after signIn call.');
      }
      // If neither of the above, it might be an unhandled next step or an issue.
      // The Hub listener in App.tsx should eventually reflect the state.
    } catch (err: any) {
      console.error('Login.tsx: Error signing in:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmNewPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      console.log('Login.tsx: New password confirmed successfully.');
      // At this point, Amplify Hub should emit 'signedIn' event
      // and App.tsx will handle navigation.
    } catch (err: any) {
      console.error('Login.tsx: Error confirming new password:', err);
      setError(err.message || 'Error al confirmar la nueva contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'CONFIRM_NEW_PASSWORD') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
          <h3 className="text-2xl font-bold text-center text-blue-700">Establecer Nueva Contraseña</h3>
          <form onSubmit={handleConfirmNewPassword}>
            <div className="mt-4">
              <div>
                <label className="block" htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Nueva Contraseña"
                  id="newPassword"
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Confirmar Nueva Contraseña"
                  id="confirmPassword"
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
              <div className="flex items-baseline justify-between">
                <button
                  type="submit"
                  className="px-6 py-2 mt-4 text-white bg-blue-700 rounded-lg hover:bg-blue-800 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Confirmando...' : 'Confirmar Contraseña'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-blue-700">Iniciar Sesión</h3>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="username">Usuario</label>
              <input
                type="text"
                placeholder="Usuario o Email"
                id="username"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                id="password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-700 rounded-lg hover:bg-blue-800 w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
            {/* Podrías agregar enlaces para "Olvidé mi contraseña" o "Registrarse" aquí */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
