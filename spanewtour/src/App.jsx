import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Cards from './Cards';
import { BrowserRouter, Routes, Link, Route } from "react-router-dom";

const supabase = createClient(
  'https://fbnksoaqkdblysrswdrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmtzb2Fxa2RibHlzcnN3ZHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzA3MzIsImV4cCI6MjA1MTE0NjczMn0.l1fT3s5gaOlqJ2r_Hza6KHPYyq0WZPKeX2Ly6xbqWug'
);

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const urlImg = './src/assets/iconeBranco.svg';

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
      <div className="container mt-4 rounded bg-white shadow" style={{ width: '25rem' }}>
        <div>
          <br />
          <h2>Login</h2>
          <p className="text-body-secondary">Informe suas credenciais para acessar o sistema.</p>
          <hr />
        </div>
        <div>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <nav className="navbar bg-danger" data-bs-theme="dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
            <i class="bi bi-stack-overflow"></i> {user?.email}
            </a>
            <button onClick={signOut} className="btn btn-danger">Sair</button>
          </div>
        </nav>
      </div>
      {/* <div className="container mt-4">
        <h2>Bem-vindo, {user?.email}!</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Email</th>
              <th scope="col">Criado em</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{user?.id}</td>
              <td>{user?.email}</td>
              <td>{new Date(user?.created_at).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div> */}
      <div className='container'>
        <BrowserRouter>
          <ul className="nav justify-content-center mt-4 nav-tabs mb-3">
            <li className="nav-item">
              <li className='nav-link fs-4'><Link to="/">Entregas</Link></li>
            </li>
            <li className="nav-item">
              <li className='nav-link fs-4'><Link to="/ematendimento">Em atendimento</Link></li>
            </li>
            <li className="nav-item">
              <li className='nav-link fs-4'><Link to="/finalizados">Finalizados</Link></li>
            </li>
            <li className="nav-item">
              <li className='nav-link fs-4'><Link to="/">Entregas</Link></li>
            </li>
          </ul>
          <Routes>
            <Route path='/' element={<Cards />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
