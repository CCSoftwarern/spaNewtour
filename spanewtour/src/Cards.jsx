import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SidePanel from './SidePanel';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './animation.css'; // Importação do arquivo CSS para animação

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function Cards() {
    const [entregas, setEntregas] = useState([]);
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [currentEntrega, setCurrentEntrega] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    // const fetchData = async (status) => {
    //     const { data, error } = await supabase
    //         .from('entregas')
    //         .select('*')
    //         .eq('status', status) // Filtrar pelo status
    //         .order('id', { ascending: true });
    
    //     if (error) {
    //         setError(error);
    //     } else {
    //         setEntregas(data);
    //     }
    // };

    // const fetchData = async (status) => {
    //     const { data, error } = await supabase
    //         .from('entregas,pessoa')
    //         .select('entregas.id, pessoa.nome') // Seleciona o id da entrega e o nome da pessoa
    //         .or('entregas.id_pessoa = pessoa.idpessoa')
    //         .order('id', { ascending: true });
    
    //     if (error) {
    //         setError(error);
    //     } else {
    //         setEntregas(data);
    //     }
    // };

    const fetchData = async (status) => {
        const { data, error } = await supabase
            .rpc('fetch_entregas_com_nome_cliente');
    
        if (error) {
            console.error('Erro ao carregar os dados:', error);
            setError(error);
        } else {
            console.log('Dados carregados:', data); // Adicione este log para verificar a estrutura dos dados
            setEntregas(data);
        }
    };

    

    const deleteEntrega = async (id) => {
        const { error } = await supabase
            .from('entregas')
            .delete()
            .eq('id', id);
        if (error) {
            setError(error);
        } else {
            setEntregas(entregas.filter(entrega => entrega.id !== id));
        }
    };

    const updateEntrega = async (entrega) => {
        const { data, error } = await supabase
            .from('entregas')
            .update({ id_pessoa: entrega.id_pessoa, endereco_retirada: entrega.endereco_retirada, endereco_entrega: entrega.endereco_entrega })
            .eq('id', entrega.id);
        if (error) {
            setError(error);
        } else {
            setEntregas(entregas.map(e => (e.id === entrega.id ? data[0] : e)));
        }
    };

    const insertEntrega = async (newEntrega) => {
        const { data, error } = await supabase
            .from('entregas')
            .insert([newEntrega]);
        if (error) {
            setError(error);
        } else {
            fetchData();
            setEntregas([...entregas, data[0]]);
        }
    };

    const toggleSidePanel = () => {
        setIsPanelOpen(!isPanelOpen);
        setCurrentEntrega(null);
    };

    const openEditPanel = (entrega) => {
        setCurrentEntrega(entrega);
        setIsPanelOpen(true);
    };

    if (error) {
        return <div>Erro ao carregar os dados: {error.message}</div>;
    };

    useEffect(() => {
        fetchData(); // Chama a função inicialmente para carregar os dados
        const intervalId = setInterval(() => {
            fetchData(); // Atualiza os dados a cada 10 segundos
        }, 5000); // 10000 milissegundos = 10 segundos

        // Limpa o intervalo quando o componente for desmontado
        return () => clearInterval(intervalId);
    }, []); // O array vazio garante que o efeito seja executado apenas uma vez ao montar o componente

    return (
        <div className='container-fluid'>
            <div className={`container ${isPanelOpen ? 'side-panel-open' : ''}`}>
            <div className="btn-group" role="group" aria-label="Basic outlined example">
                <button type="button" className="btn btn btn-success btn-lg" onClick={toggleSidePanel}>Inserir</button>
                <button type="button" className="btn btn-outline-primary btn-lg" onClick={fetchData}>Atualizar</button>
                <button type="button" className="btn btn-outline-primary btn-lg">Right</button>
            </div>

            <TransitionGroup className="table mt-3">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nome cliente</th>
                            <th scope="col">Endereço de Retirada</th>
                            <th scope="col">Endereço de Entrega</th>
                            <th scope="col">Valor</th>
                            <th scope="col">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entregas.map((entrega) => (
                            <CSSTransition key={entrega.id} timeout={500} classNames="fade">
                                <tr>
                                    <td>{entrega.id}</td>
                                    <td>{entrega.nome_cliente}</td>
                                    <td>{entrega.endereco_retirada}</td>
                                    <td>{entrega.endereco_entrega}</td>
                                    <td>R$ {entrega.vr_calculado}</td>
                                    <td>
                                        <div className="btn-group" role="group" aria-label="Basic outlined example">
                                            <button className="btn btn-primary" onClick={() => alert(`Visualizar ${entrega.id}`)}>Visualizar</button>
                                            <button className="btn btn-secondary" onClick={() => openEditPanel(entrega)}>Editar</button>
                                            <button className="btn btn-danger" onClick={() => deleteEntrega(entrega.id)}>Deletar</button>
                            
                                        </div>
                                    </td>
                                </tr>
                            </CSSTransition>
                        ))}
                    </tbody>
                </table>
            </TransitionGroup>

            {isPanelOpen && <SidePanel onClose={toggleSidePanel} onInsert={insertEntrega} onUpdate={updateEntrega} entrega={currentEntrega} />}
        </div>

        </div>
        
    );
}

export default Cards;
