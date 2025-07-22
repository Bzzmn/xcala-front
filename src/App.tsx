import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub, HubCapsule } from 'aws-amplify/utils'; // Or from '@aws-amplify/core' if using older Amplify
import { BarChart3, Building2, Briefcase, TrendingUp, Wallet } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login'; // Importar el componente Login

import '@xcala/chat-widget/dist/index.css';
import { ChatWidget, ChatWidgetConfig } from '@xcala/chat-widget';
import { getChatConfig, awsCognitoConfig } from './config'; // Importar la función getChatConfig

Amplify.configure(awsCognitoConfig);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Para evitar parpadeo
  const [widgetConfig, setWidgetConfig] = useState<ChatWidgetConfig | null>(null);
  

  // Effect for initial authentication check and listening to auth events
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuthState(); // Check initial state
    console.log('App.tsx: Setting up Amplify Hub listener for auth events.');

    const listener = (data: HubCapsule<'auth', any>) => {
      switch (data.payload.event) {
        case 'signedIn':
        case 'autoSignIn': // Handles cases where user was already signed in (e.g. session persisted)
        case 'signInWithRedirect': // If you use federated sign-in or redirect-based flows
          console.log('App.tsx: Hub event - signedIn, autoSignIn, or signInWithRedirect. Setting isAuthenticated to true.');
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          break;
        case 'signedOut':
          console.log('App.tsx: Hub event - signedOut. Setting isAuthenticated to false.');
          setIsAuthenticated(false);
          setWidgetConfig(null); // Clear widget config on sign out
          setIsLoadingAuth(false);
          break;
        case 'autoSignIn_failure':
        case 'signInWithRedirect_failure':
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          break;
        // You can add other cases like 'tokenRefresh', 'tokenRefresh_failure' if needed
      }
    };

    const unsubscribe = Hub.listen('auth', listener);

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []); // Runs once on mount

  // Effect for updating widgetConfig based on authentication state and chat config
  useEffect(() => {
    const updateUserWidgetConfig = async () => {
      if (isAuthenticated) {
        try {
          const [user, session] = await Promise.all([
            getCurrentUser(),
            fetchAuthSession(),
          ]);

          const userIdFromAmplify = user.username || user.signInDetails?.loginId;
          const idToken = session.tokens?.idToken?.toString();
          
          if (userIdFromAmplify) {
            console.log('User ID from Amplify for widget config:', userIdFromAmplify);
          } else {
            console.warn('Could not retrieve a user ID from Amplify. Widget will be configured without a specific user ID.');
          }

                    const baseConfig = getChatConfig(); // ¡Llamar a la función aquí!

          if (!baseConfig.langGraphApiUrl || !baseConfig.assistantId || !baseConfig.langSmithApiKey || !baseConfig.audioApiUrl) {
            console.error('Missing required chat configuration parameters from window.env. Widget will not be configured.');
            setWidgetConfig(null);
            return;
          }

          const newWidgetConfig: ChatWidgetConfig = {
            ...baseConfig,
            userId: userIdFromAmplify,
            idToken: idToken,
          };


          setWidgetConfig(newWidgetConfig);

        } catch (error) {
          console.error('Error fetching current user or setting widget config:', error);
          setWidgetConfig(null); // Ensure config is null on error
        }
      } else {
        // User is not authenticated, ensure widgetConfig is null.
        setWidgetConfig(null);
      }
    };

    updateUserWidgetConfig();
  }, [isAuthenticated]); // El array de dependencias ahora solo necesita isAuthenticated

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  console.log(`App.tsx: Rendering - isAuthenticated: ${isAuthenticated}, isLoadingAuth: ${isLoadingAuth}`);
  if (isLoadingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>; // O un spinner
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Botón de Logout de ejemplo en el Navbar o aquí */}
      <div className="container mx-auto px-4 py-2 flex justify-end">
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-blue-700">Invierte como</span>
            <br />
            los que saben.
          </h1>
          <p className="text-gray-600 mb-6">
            Fondos que eran solo para grandes inversionistas,
            hoy también son para ti
          </p>
          <button className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition">
            Regístrate
          </button>
        </div>
        <div className="md:w-1/2">
          <img 
            src="/hero_xcala.webp"
            alt="Activos Alternativos"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Investment Options */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">¿Qué puedes encontrar en Xcala?</h2>
          <p className="text-center text-gray-600 mb-12">En Xcala pones a tu disposición lo mejor de los Activos Alternativos</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <InvestmentOption icon={<Building2 />} title="Deuda Privada" />
            <InvestmentOption icon={<Briefcase />} title="Renta Inmobiliaria" />
            <InvestmentOption icon={<TrendingUp />} title="Venture Capital" />
            <InvestmentOption icon={<BarChart3 />} title="Hedge Funds" />
            <InvestmentOption icon={<Wallet />} title="Cripto Activos" />
          </div>
        </div>
        {/* Chat Widget Button */}
        {widgetConfig && (
          <ChatWidget config={widgetConfig} />
        )}
      </section>

      {/* How it Works */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="/xcala_video.webp"
                alt="Office building"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-8">¿Cómo funciona?</h2>
              <div className="space-y-6">
                <Step number={1} title="PERFIL INVERSIONISTA" description="Queremos saber tu perfil como inversionista, tus objetivos y nivel de tolerancia al riesgo" />
                <Step number={2} title="PREFERENCIAS" description="Conocemos cuáles son tus objetivos e intereses de inversión" />
                <Step number={3} title="ALTERNATIVAS" description="Según tu perfil de inversionista, te mostramos las mejores alternativas" />
                <Step number={4} title="INVIERTE" description="Observa cómo se multiplica tu inversión y obtén grandes retornos" />
              </div>
              <button className="mt-8 bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg hover:bg-yellow-500 transition font-semibold">
                Regístrate ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Empieza a multiplicar hoy,</h2>
              <h3 className="text-2xl font-bold mb-6">fácil y rápido</h3>
              <p className="mb-8">
                Invierte en activos alternativos de alta rentabilidad pensados para todo tu futuro, en pocos minutos y desde cualquier dispositivo
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/xcala_movil.webp"
                alt="Mobile app"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ... (InvestmentOption y Step components se mantienen igual)
function InvestmentOption({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-bold mb-1">{title}</h4>
        <p className="text-gray-200">{description}</p>
      </div>
    </div>
  );
}


export default App;