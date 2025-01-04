import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SidePanel from './SidePanel';
import { EyeFill } from 'react-bootstrap-icons';

const supabaseUrl =  import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY ;
const supabase = createClient(supabaseUrl, supabaseKey);

function Cards() {
    const [entregas, setEntregas] = useState([]);
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [currentEntrega, setCurrentEntrega] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data, error } = await supabase.from('entregas').select('*').order('id', { ascending: true });
        if (error) {
            setError(error);
        } else {
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
            // Recarrega os dados da lista após a inserção, se necessário
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
    }

    return (
        <div className={`container ${isPanelOpen ? 'side-panel-open' : ''}`}>
            <div className="btn-group" role="group" aria-label="Basic outlined example">
                <button type="button" className="btn btn btn-success btn-lg" onClick={toggleSidePanel}>Inserir</button>
                <button type="button" className="btn btn-outline-primary btn-lg" onClick={fetchData}>Atualizar</button>
                <button type="button" className="btn btn-outline-primary btn-lg">Right</button>
            </div>

            <table className="table mt-3">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">ID Pessoa</th>
                        <th scope="col">Endereço de Retirada</th>
                        <th scope="col">Endereço de Entrega</th>
                        <th scope="col">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {entregas.map((entrega) => (
                        <tr key={entrega.id}>
                            <td>{entrega.id}</td>
                            <td>{entrega.id_pessoa}</td>
                            <td>{entrega.endereco_retirada}</td>
                            <td>{entrega.endereco_entrega}</td>
                            <td>
                                <div className="btn-group" role="group" aria-label="Basic outlined example">
                                    <button className="btn btn-primary" onClick={() => alert(`Visualizar ${entrega.id}`)}>Visualizar</button>
                                    <button className="btn btn-secondary" onClick={() => openEditPanel(entrega)}>Editar</button>
                                    <button className="btn btn-danger" onClick={() => deleteEntrega(entrega.id)}>Deletar</button>
                                    <button className="btn btn-danger" onClick={() => deleteEntrega(entrega.id)}>Imprimir</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isPanelOpen && <SidePanel onClose={toggleSidePanel} onInsert={insertEntrega} onUpdate={updateEntrega} entrega={currentEntrega} />}
        </div>
    );
}

export default Cards;
