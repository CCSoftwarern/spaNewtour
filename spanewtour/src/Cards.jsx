import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SidePanel from './SidePanel';
import SidePanelMotoboy from './SidePanelMotoboys'; // Importação do SidePanelMotoboy
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './animation.css'; // Importação do arquivo CSS para animação

const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function Cards() {
    const [entregas, setEntregas] = useState([]);
    const [motoboys, setMotoboys] = useState([]);  // Estado para armazenar os motoboys
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isMotoboyPanelOpen, setIsMotoboyPanelOpen] = useState(false);  // Estado para o painel de motoboy
    const [currentEntrega, setCurrentEntrega] = useState(null);

    useEffect(() => {
        fetchData();
        fetchMotoboys(); // Chama a função para buscar os motoboys
    }, []);

    const fetchData = async () => {
        const { data, error } = await supabase
            .rpc('fetch_entregas_com_nome_cliente');
    
        if (error) {
            console.error('Erro ao carregar os dados:', error);
            setError(error);
        } else {
            console.log('Dados carregados:', data);
            setEntregas(data);
        }
    };

    const fetchMotoboys = async () => {
        const { data, error } = await supabase
            .from('motoboys') // Aqui você vai buscar os motoboys
            .select('*');
    
        if (error) {
            console.error('Erro ao carregar os motoboys:', error);
            setError(error);
        } else {
            console.log('Motoboys carregados:', data);
            setMotoboys(data);
        }
    };

    const deleteEntrega = async (id) => {
        const shouldDelete = window.confirm("Tem certeza que deseja excluir esta entrega?");
        
        if (!shouldDelete) {
            return;
        }
        
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

    const openEncaminharPanel = (entrega) => {
        setCurrentEntrega(entrega);  // Define a entrega que será encaminhada
        setIsMotoboyPanelOpen(true);  // Abre o painel de motoboys
    };

    const openEditPanel = (entrega) => {
        setCurrentEntrega(entrega);  // Define a entrega que será editada
        setIsPanelOpen(true);        // Abre o SidePanel
    };

    const closeMotoboyPanel = () => {
        setIsMotoboyPanelOpen(false);  // Fecha o painel de motoboys
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
        <div className="container-fluid">
            <div className={`container ${isPanelOpen || isMotoboyPanelOpen ? 'side-panel-open' : ''}`}>
                <div className="btn-group d-flex flex-wrap" role="group" aria-label="Basic outlined example">
                    <button type="button" className="btn btn-success btn-lg mb-3" onClick={toggleSidePanel}>Inserir</button>
                    <button type="button" className="btn btn-outline-primary btn-lg mb-3" onClick={fetchData}>Atualizar</button>
                </div>

                <TransitionGroup className="table-responsive mt-3">
                    <table className="table table-bordered">
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
                                                <button className="btn btn-primary" onClick={() => openEncaminharPanel(entrega)}>Encaminhar</button>
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

                {/* Exibe o SidePanel para editar ou inserir entrega */}
                {isPanelOpen && <SidePanel onClose={toggleSidePanel} onInsert={insertEntrega} onUpdate={updateEntrega} entrega={currentEntrega} />}

                {/* Exibe o SidePanelMotoboy para encaminhar a entrega */}
                {isMotoboyPanelOpen && <SidePanelMotoboy onClose={closeMotoboyPanel} entrega={currentEntrega} motoboys={motoboys} />}
            </div>
        </div>
    );
}

export default Cards;
