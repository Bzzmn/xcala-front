import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { BarChart3, Building2, Briefcase, TrendingUp, Wallet } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';

import '@xcala/chat-widget/dist/index.css';
import { ChatWidget, ChatWidgetConfig } from '@xcala/chat-widget';
import { getChatConfig, awsCognitoConfig } from './config';
import { useAuth } from './hooks/useAuth'; 

Amplify.configure(awsCognitoConfig);

// Componente para una opción de inversión (helper)
const InvestmentOption = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="bg-white p-4 rounded-full shadow-md mb-2">{icon}</div>
    <span className="font-semibold">{title}</span>
  </div>
);

function App() {
  const { isAuthenticated, isLoading, user, idToken, handleLogout } = useAuth();
  const [widgetConfig, setWidgetConfig] = useState<ChatWidgetConfig | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && idToken) {
      const baseConfig = getChatConfig();
      const userId = user.username || user.signInDetails?.loginId;

      if (!baseConfig.langGraphApiUrl || !userId) {
        console.error('Missing required chat configuration or user ID. Widget will not be configured.');
        setWidgetConfig(null);
        return;
      }

      const newConfig: ChatWidgetConfig = {
        ...baseConfig,
        userId: userId,
        idToken: idToken,
      };
      setWidgetConfig(newConfig);

    } else {
      setWidgetConfig(null);
    }
  }, [isAuthenticated, user, idToken]); 

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-2 flex justify-end">
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-blue-700">Invierte como</span><br />los que saben.
          </h1>
          <p className="text-gray-600 mb-6">
            Fondos que eran solo para grandes inversionistas, hoy también son para ti
          </p>
          <button className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition">
            Regístrate
          </button>
        </div>
        <div className="md:w-1/2">
          <img src="/hero_xcala.webp" alt="Activos Alternativos" className="w-full h-auto" />
        </div>
      </section>

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
        {widgetConfig && <ChatWidget config={widgetConfig} />}
      </section>

      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src="/xcala_video.webp" alt="Office building" className="rounded-lg shadow-xl" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="mb-4">Invierte en tres simples pasos.</p>
              {/* ... más contenido ... */}
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


export default App;