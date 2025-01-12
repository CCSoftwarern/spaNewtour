import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SidePanel from './SidePanel';
import SidePanelMotoboy from './SidePanelMotoboys'; // Importação do SidePanelMotoboy
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './animation.css'; // Importação do arquivo CSS para animação
import '@fortawesome/fontawesome-free/css/all.min.css';

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
    const [searchTerm, setSearchTerm] = useState(''); // Estado para armazenar o termo de pesquisa
    const img = 'https://img.pikbest.com/backgrounds/20200423/2d-labor-day-delivery-banner_1910020.jpg!bw700'

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

    // Filtra as entregas com base no nome do cliente
    const filteredEntregas = entregas.filter(entrega =>
        entrega.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className={`container ${isPanelOpen || isMotoboyPanelOpen ? 'side-panel-open' : ''}`}>
            <div className="btn-group" role="group" aria-label="Basic outlined example">
                <button type="button" className="btn btn-success btn-lg mb-3" onClick={toggleSidePanel}>Inserir</button>
                <button type="button" className="btn btn-outline-primary btn-lg mb-3" onClick={fetchData}>Atualizar</button>
            </div>

            {/* Caixa de pesquisa */}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar pelo nome do cliente"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <hr />

            {/* Row contendo as colunas de cards */}
            <div className="row row-cols-1 row-cols-md-4 g-4">
                {filteredEntregas.map((entrega) => (
                    <TransitionGroup>
                        <CSSTransition key={entrega.id} timeout={500} classNames="fade">
                            <div className="col">
                                <div className="card h-100 shadow-sm">
                                    <img src={img} className="card-img-top" alt="..." style={{ maxHeight: '150px', objectFit: 'cover' }} />
                                    <div className="card-body p-2">
                                        <h5 className="card-title text-truncate" style={{ fontSize: '1rem' }}>
                                            Entrega #{entrega.id}
                                        </h5>

                                        <p className="card-text text-truncate fs-5" style={{ fontSize: '0.875rem' }}>
                                            <i className="fas fa-user"></i> {entrega.nome_cliente}
                                        </p>

                                        <p className="card-text text-truncate" style={{ fontSize: '0.875rem' }}>
                                            <i className="fas fa-map-marker-alt"></i> {entrega.endereco_retirada}
                                        </p>

                                        <p className="card-text text-truncate" style={{ fontSize: '0.875rem' }}>
                                            <i className="fas fa-map-pin"></i> {entrega.endereco_entrega}
                                        </p>

                                        <p className="card-text" style={{ fontSize: '0.875rem' }}>
                                            <i className="fas fa-money-bill-wave"></i> R$ {entrega.vr_calculado}
                                        </p>

                                        <div className="btn-group btn-group-sm" role="group" aria-label="Basic outlined example">
                                            <button className="btn btn-primary btn-sm" onClick={() => openEncaminharPanel(entrega)}>
                                                <i className="fas fa-paper-plane"></i> Encaminhar
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEditPanel(entrega)}>
                                                <i className="fas fa-edit"></i> Editar
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => deleteEntrega(entrega.id)}>
                                                <i className="fas fa-trash-alt"></i> Deletar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CSSTransition>
                    </TransitionGroup>
                ))}
            </div>


            {/* Exibe o SidePanel para editar ou inserir entrega */}
            {isPanelOpen && <SidePanel onClose={toggleSidePanel} onInsert={insertEntrega} onUpdate={updateEntrega} entrega={currentEntrega} />}

            {/* Exibe o SidePanelMotoboy para encaminhar a entrega */}
            {isMotoboyPanelOpen && <SidePanelMotoboy onClose={closeMotoboyPanel} entrega={currentEntrega} motoboys={motoboys} />}
        </div>
    );
}

export default Cards;
