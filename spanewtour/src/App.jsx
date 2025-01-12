import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Cards from './Cards';
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair:', error);
    } else {
      console.log('Usuário deslogado com sucesso');
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { user } = session;
        setUser(user);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const { user } = session;
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); 

  if (!session) {
    return (
      <div className="container mt-5 p-4 rounded bg-white shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="mb-3">Login</h2>
        <p className="text-muted mb-4">Informe suas credenciais para acessar o sistema.</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    );
  }

  return (
    <BrowserRouter> {/* Envolva toda a aplicação com o BrowserRouter */}
      <>
        <div>
          <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
            <div className="container-fluid">
              <a className="navbar-brand fs-4" href="#">
                <i className="bi bi-stack-overflow me-2"></i>{user?.email}
              </a>
              <button onClick={signOut} className="btn btn-outline-light">Sair</button>
            </div>
          </nav>
        </div>

        <div className="d-flex">
          {/* Sidebar */}
          <div className="bg-light border-end" style={{ width: '250px', height: '100vh' }}>
            <ul className="nav flex-column p-3">
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/">Entregas</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/ematendimento">Em Atendimento</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/finalizados">Finalizados</Link>
              </li>
            </ul>
          </div>

          {/* Main content */}
          <div className="container mt-4" style={{ marginLeft: '250px', flex: 1 }}>
            <Routes>
              <Route path="/" element={<Cards />} />
              {/* Defina as rotas adicionais aqui se necessário */}
            </Routes>
          </div>
        </div>
      </>
    </BrowserRouter> 
  );
}
