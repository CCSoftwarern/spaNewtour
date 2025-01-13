import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Button, Form } from 'react-bootstrap';
import { createClient } from '@supabase/supabase-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SidePanelMotoboy = ({ onClose, entrega }) => {
  const [motoboys, setMotoboys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entregas, setEntregas] = useState([]);

  useEffect(() => {
    const fetchMotoboys = async () => {
      const { data, error } = await supabase
        .from('motoboys')
        .select('id, nome, celular, enail, dt_nascimento, cep, endereco, numero, obs, ativo');

      if (error) {
        console.error('Erro ao buscar motoboys:', error);
      } else {
        setMotoboys(data);
      }
    };

    const fetchEntregas = async () => {
      const { data, error } = await supabase
        .from('entregas')
        .select('id, status, id_motoqueiro')
        .eq('status', 0);

      if (error) {
        console.error('Erro ao buscar entregas:', error);
      } else {
        setEntregas(data);
      }
    };

    fetchMotoboys();
    fetchEntregas();
  }, []);

  const filteredMotoboys = motoboys.filter(motoboy =>
    motoboy.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnviarClick = async (idMotoboy) => {
    const { data, error } = await supabase
      .from('entregas')
      .update({
        status: 1,
        id_motoqueiro: idMotoboy,
      })
      .eq('id', entrega.id);

    if (error) {
      console.error('Erro ao atualizar a entrega:', error);
    } else {
      console.log('Entrega atualizada com sucesso:', data);
    }
  };

  const handleToggleStatus = async (idMotoboy, ativo) => {
    const { data, error } = await supabase
      .from('motoboys')
      .update({ ativo: !ativo })
      .eq('id', idMotoboy);

    if (error) {
      console.error('Erro ao alterar status do motoboy:', error);
    } else {
      setMotoboys(prevMotoboys =>
        prevMotoboys.map(motoboy =>
          motoboy.id === idMotoboy ? { ...motoboy, ativo: !ativo } : motoboy
        )
      );
      console.log('Status do motoboy atualizado com sucesso:', data);
    }
  };

  // Função para formatar o número de celular
  const formatarCelular = (celular) => {
    // Remove tudo que não for número
    const celularFormatado = celular.replace(/\D/g, '');
    // Aplica a máscara (XX) XXXXX-XXXX
    return celularFormatado.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '($1) $2-$3'
    );
  };

  return (
    <div style={styles.sidePanel} className="shadow">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="fs-5">Motoboys</h3>
        <Button onClick={onClose} variant="danger" size="sm">
          Fechar
        </Button>
      </div>

      <div className="mt-2">
        <Form.Control
          type="text"
          placeholder="Pesquisar por nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
          size="sm"
        />
      </div>

      <div>
        {filteredMotoboys.length === 0 ? (
          <p>Carregando motoboys...</p>
        ) : (
          filteredMotoboys.map((motoboy) => (
            <Card
              key={motoboy.id}
              className={`mb-2 ${motoboy.ativo ? '' : 'bg-light'}`} // Cor do card dependendo do status
              style={{ width: '100%' }}
            >
              <Card.Body className="p-2">
                <Card.Title className="d-flex align-items-center fs-5">
                  <i className="bi bi-person-circle me-2"></i>
                  {motoboy.nome}
                </Card.Title>
                <ListGroup variant="flush" className="p-0">
                  <ListGroup.Item className="p-1">
                    <strong>Celular:</strong>
                    {/* Exibindo o celular formatado como texto */}
                    <span>{formatarCelular(motoboy.celular)}</span>
                    {/* Ícone de WhatsApp com link */}
                    <a
                      href={`https://api.whatsapp.com/send?phone=${motoboy.celular.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ms-2 text-success"
                    >
                      <i className="bi bi-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                    </a>
                  </ListGroup.Item>
                 
                </ListGroup>
                <Form.Check
                  type="switch"
                  id={`switch-ativo-${motoboy.id}`}
                  label={motoboy.ativo ? 'Ativo' : 'Inativo'}
                  checked={motoboy.ativo}
                  onChange={() => handleToggleStatus(motoboy.id, motoboy.ativo)}
                  className="mt-2"
                />
                <Button
                  variant="success"
                  onClick={() => handleEnviarClick(motoboy.id)}
                  className="mt-2 w-100"
                  size="sm"
                  disabled={!motoboy.ativo}
                >
                  Enviar
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  sidePanel: {
    width: '300px',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    padding: '10px',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 9999,
    overflowY: 'auto',
  }
};

export default SidePanelMotoboy;
