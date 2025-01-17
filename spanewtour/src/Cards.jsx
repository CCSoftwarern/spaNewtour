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
    const [loading, setLoading] = useState(false); // Estado para controle de loading
    const img = 'https://img.pikbest.com/backgrounds/20200423/2d-labor-day-delivery-banner_1910020.jpg!bw700'

    useEffect(() => {
        fetchData();
        fetchMotoboys(); // Chama a função para buscar os motoboys
    }, []);

    const fetchData = async () => {
        setLoading(true); // Inicia o carregamento
        const { data, error } = await supabase
            .rpc('fetch_entregas_com_nome_cliente');

        if (error) {
            console.error('Erro ao carregar os dados:', error);
            setError(error);
        } else {
            console.log('Dados carregados:', data);
            setEntregas(data);
        }
        setLoading(false); // Finaliza o carregamento
    };

    const fetchMotoboys = async () => {
        setLoading(true); // Inicia o carregamento
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
        setLoading(false); // Finaliza o carregamento
    };

    const deleteEntrega = async (id) => {
        const shouldDelete = window.confirm("Tem certeza que deseja excluir esta entrega?");
        if (!shouldDelete) return;

        setLoading(true); // Inicia o carregamento
        const { error } = await supabase
            .from('entregas')
            .delete()
            .eq('id', id);

        if (error) {
            setError(error);
        } else {
            setEntregas(entregas.filter(entrega => entrega.id !== id));
        }
        setLoading(false); // Finaliza o carregamento
    };

    const updateEntrega = async (entrega) => {
        setLoading(true); // Inicia o carregamento
        const { data, error } = await supabase
            .from('entregas')
            .update({ id_pessoa: entrega.id_pessoa, endereco_retirada: entrega.endereco_retirada, endereco_entrega: entrega.endereco_entrega })
            .eq('id', entrega.id);
        if (error) {
            setError(error);
        } else {
            setEntregas(entregas.map(e => (e.id === entrega.id ? data[0] : e)));
        }
        setLoading(false); // Finaliza o carregamento
    };

    const insertEntrega = async (newEntrega) => {
        setLoading(true); // Inicia o carregamento
        const { data, error } = await supabase
            .from('entregas')
            .insert([newEntrega]);
        if (error) {
            setError(error);
        } else {
            fetchData();
            setEntregas([...entregas, data[0]]);
        }
        setLoading(false); // Finaliza o carregamento
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

    //formatar data por extenso
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',  // Exibe o dia da semana
            year: 'numeric',  // Exibe o ano
            month: 'long',    // Exibe o mês por extenso
            day: 'numeric',   // Exibe o dia
        });
    };
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
    
        // Subtrai 3 horas da data
        date.setHours(date.getHours() - 3);
    
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,  // Exibe no formato 24h
        });
    };
    
    
    

    return (
        
        <div className={`container ${isPanelOpen || isMotoboyPanelOpen ? 'side-panel-open' : ''}`}>
          <h3>Entregas</h3>
            <div className="btn-group mt-3" role="group" aria-label="Basic outlined example">
                <button type="button" className="btn btn-success btn-lg mb-3" onClick={toggleSidePanel}>Inserir</button>
                <button type="button" className="btn btn-outline-primary btn-lg mb-3" onClick={fetchData}>Atualizar</button>

                {/* Exibe um spinner de carregamento se o estado de loading for verdadeiro */}

                <div className='container-fluid'>
                {loading && (
                    <div className="d-flex justify-content-center my-2 ">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden" >Carregando...</span>
                        </div>
                    </div>
                )}

                </div>

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
                                <div className="card h-100 shadow-lg">
                                    <img src={img} className="card-img-top" alt="..." style={{ maxHeight: '150px', objectFit: 'cover' }} />
                                    <div className="card-body p-2">
                                        <h5 className="card-title text-truncate" style={{ fontSize: '1rem' }}>
                                            Entrega #{entrega.id}
                                        </h5>
                                        <p className="card-text" style={{ fontSize: '0.875rem' }}>
                                            <i className="bi bi-calendar3"></i> {formatDateTime(entrega.dt_cadastro)}
                                        </p>

                                        <p className="card-text text-truncate fw-bold" style={{ fontSize: '1.2rem' }}>
                                            <i className="bi bi-person-circle"></i> {entrega.nome_cliente}
                                        </p>

                                        <p className="card-text text-truncate" style={{ fontSize: '0.875rem' }}>
                                            <i className="bi bi-pin-map-fill"></i> {entrega.endereco_retirada}
                                        </p>

                                        <p className="card-text text-truncate" style={{ fontSize: '0.875rem' }}>
                                            <i className="bi bi-geo-fill"></i> {entrega.endereco_entrega}
                                        </p>

                                        <p className="card-text text-end fs-5 text fw-bold" style={{ fontSize: '1rem' }}>
                                            <i className="bi bi-coin"></i> R$ {entrega.vr_calculado}
                                        </p>

                                        <div className='card-footer'>
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
