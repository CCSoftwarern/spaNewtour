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
    <BrowserRouter>
      <div className="d-flex flex-column flex-md-row ">
        {/* Sidebar */}
        <div
          className="bg-danger text-white border-end shadow position-fixed"
          style={{ width: '250px', height: '100vh', padding: '1rem' }}

        >
          <div class="text-wrap text-center">
            <i className="bi bi-person" style={{ marginRight: '10px' }}></i>
            {user?.email}
          </div>

          <hr />
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link fs-5 text-white d-flex align-items-center btn btn-danger" to="/">
                <i className="bi bi-boxes" style={{ marginRight: '10px' }}></i>
                Entregas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fs-5 text-white d-flex align-items-center btn btn-danger" to="/ematendimento">
                <i className="bi bi-clock" style={{ marginRight: '10px' }}></i>
                Em Atendimento
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fs-5 text-white d-flex align-items-center btn btn-danger" to="/finalizados">
                <i className="bi bi-check-circle" style={{ marginRight: '10px' }}></i>
                Finalizados
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fs-5 text-white d-flex align-items-center btn btn-danger" to="/cadastromotoboys">
                <i className="bi bi-person-workspace" style={{ marginRight: '10px' }}></i>
                Motoboys
              </Link>
            </li>
            <hr />
            <li className="nav-item">
              <button onClick={signOut} className="nav-link fs-5 text-white d-flex align-items-center btn btn-danger"><i class="bi bi-door-closed" style={{ marginRight: '10px' }}></i>  Sair</button>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="container mt-4" style={{ marginLeft: '250px', padding: '1rem', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Cards />} />
            {/* Defina as rotas adicionais aqui se necessário */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
