import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Select from 'react-select';
import './SidePanel.css';

const supabaseUrl =  import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY ;
const supabase = createClient(supabaseUrl, supabaseKey);

const SidePanel = ({ onClose, onInsert, onUpdate, entrega }) => {
    const [enderecoRetirada, setEnderecoRetirada] = useState(entrega ? entrega.endereco_retirada : '');
    const [enderecoEntrega, setEnderecoEntrega] = useState(entrega ? entrega.endereco_entrega : '');
    const [idPessoa, setIdPessoa] = useState(entrega ? entrega.id_pessoa : ''); // Aqui guardamos o idPessoa
    const [searchTerm, setSearchTerm] = useState('');
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const panelRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const fetchPessoas = async () => {
            if (searchTerm.trim() === '') {
                setPessoas([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('pessoa')
                .select('*')
                .like('nome', `%${searchTerm}%`)
                .order('nome', { ascending: true });

            if (error) {
                console.error('Erro ao buscar pessoas:', error);
                setError('Erro ao buscar pessoas.');
            } else {
                setPessoas(data || []); // Garantir que a variável `data` nunca seja `null` ou `undefined`
                setError('');
            }
            setLoading(false);
        };

        fetchPessoas();
    }, [searchTerm]);

    const handleEntregaSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Limpa qualquer erro anterior

        const newEntrega = { endereco_retirada: enderecoRetirada, endereco_entrega: enderecoEntrega, id_pessoa: idPessoa }; // idPessoa sendo passado para o campo de entrega
        
        try {
            let response;
            if (entrega) {
                // Atualização da entrega
                response = await supabase
                    .from('entregas')
                    .update(newEntrega)
                    .eq('id', entrega.id);

                if (response.error) {
                    throw new Error(response.error.message);
                }

                // Verificando se há dados na resposta e atualizando
                if (response.data && response.data.length > 0) {
                    const updatedEntrega = response.data[0];
                    onUpdate(updatedEntrega);
                } else {
                    throw new Error('Erro ao atualizar entrega: Dados não encontrados.');
                }
            } else {
                // Inserção da entrega
                response = await supabase.from('entregas').insert([newEntrega]);

                if (response.error) {
                    throw new Error(response.error.message);
                }

                // Verificando se há dados na resposta e inserindo
                if (response.data && response.data.length > 0) {
                    const insertedEntrega = response.data[0];
                    onInsert(insertedEntrega);
                } else {
                    throw new Error('Erro ao inserir entrega: Dados não encontrados.');
                }
            }

            onClose(); // Fechar a sidebar após a inserção ou atualização
        } catch (error) {
            setError('Erro ao salvar entrega: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePessoaSelect = (selectedOption) => {
        if (selectedOption) {
            setIdPessoa(selectedOption.value); // Aqui estamos pegando o idPessoa da seleção
            // Preenche os endereços da pessoa selecionada
            setEnderecoRetirada(selectedOption.endereco);
            setEnderecoEntrega(selectedOption.endereco);
        }
    };

    return (
        <div className="side-panel" ref={panelRef}>
            <div className="side-panel-content">
                <button className="btn btn-close" onClick={onClose}>Fechar</button>
                <h2>{entrega ? 'Atualizar Entrega' : 'Inserir Entrega'}</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Se não houver idPessoa (pessoa não selecionada), exibe o campo de busca */}
                {!idPessoa ? (
                    <div>
                        <div className="mb-3">
                            <label htmlFor="pessoaSearch" className="form-label">Pesquisar Pessoa</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="pessoaSearch" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquise pelo nome"
                            />
                        </div>
                        {loading && <div>Carregando...</div>}
                        {pessoas.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label">Selecione uma Pessoa</label>
                                <Select
                                    options={pessoas.map(pessoa => ({
                                        value: pessoa.id,   // O id da pessoa será usado como valor
                                        label: pessoa.nome, // O nome da pessoa será usado como rótulo
                                        endereco: pessoa.endereco, // Considerando que você tem um campo de "endereco" na tabela pessoa
                                    }))}
                                    onChange={handlePessoaSelect}
                                    placeholder="Digite o nome da pessoa"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    // Quando a pessoa é selecionada, mostra os campos de entrega
                    <form onSubmit={handleEntregaSubmit}>
                        <div className="mb-3">
                            <label htmlFor="enderecoRetirada" className="form-label">Endereço de Retirada</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="enderecoRetirada" 
                                value={enderecoRetirada} 
                                onChange={(e) => setEnderecoRetirada(e.target.value)} 
                                placeholder="Digite o endereço de retirada"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="enderecoEntrega" className="form-label">Endereço de Entrega</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="enderecoEntrega" 
                                value={enderecoEntrega} 
                                onChange={(e) => setEnderecoEntrega(e.target.value)} 
                                placeholder="Digite o endereço de entrega"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                        >
                            {entrega ? 'Atualizar Entrega' : 'Inserir Entrega'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SidePanel;
