import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Select from 'react-select';
import './SidePanel.css';
import InputMask from 'react-input-mask';
import {NumericFormat} from 'react-number-format';
import 'bootstrap/dist/css/bootstrap.min.css';



const supabaseUrl = import.meta.env.VITE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SidePanel = ({ onClose, onInsert, onUpdate, entrega, usuarioAtual }) => {
    const [enderecoRetirada, setEnderecoRetirada] = useState(entrega ? entrega.endereco_retirada : '');
    const [enderecoEntrega, setEnderecoEntrega] = useState(entrega ? entrega.endereco_entrega : '');
    const [idPessoa, setIdPessoa] = useState(entrega ? entrega.id_pessoa : ''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [pessoas, setPessoas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [celular, setCelular] = useState('');
    const [email, setEmail] = useState('');
    const [descricao, setDescricao] = useState(entrega ? entrega.descricao : '');
    const [vrCalculado, setVrCalculado] = useState(entrega ? entrega.vr_calculado : '');
    const [idUsuarioInclusao, setIdUsuarioInclusao] = useState(usuarioAtual ? usuarioAtual.id : null); 
    const [idFormaPgto, setIdFormaPgto] = useState(entrega ? entrega.id_forma_pgto : null); 
    const [showNewPessoaForm, setShowNewPessoaForm] = useState(false);

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

            // Modificando a consulta para buscar por nome ou telefone
            const { data, error } = await supabase
                .from('pessoa')
                .select('*')
                .or(`nome.ilike.%${searchTerm}%,celular.ilike.%${searchTerm}%`) // Busca por nome ou celular
                .order('nome', { ascending: true });

            if (error) {
                console.error('Erro ao buscar pessoas:', error);
                setError('Erro ao buscar pessoas.');
            } else {
                setPessoas(data || []);
                setError('');
            }
            setLoading(false);
        };

        fetchPessoas();
    }, [searchTerm]);

    const handleEntregaSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const newEntrega = {
            endereco_retirada: enderecoRetirada,
            endereco_entrega: enderecoEntrega,
            id_pessoa: idPessoa,
            descricao: descricao,
            vr_calculado: vrCalculado,
            id_usuario_inclusao: idUsuarioInclusao,  
            id_forma_pgto: idFormaPgto  
        };

        try {
            let response;
            if (entrega) {
                response = await supabase
                    .from('entregas')
                    .update(newEntrega)
                    .eq('id', entrega.id);
                if (response.error) {
                    throw new Error(response.error.message);
                }
            } else {
                response = await supabase.from('entregas').insert([newEntrega]);
                if (response.error) {
                    throw new Error(response.error.message);
                }
            }
            onClose(); 
        } catch (error) {
            setError('Erro ao salvar entrega: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePessoaSelect = (selectedOption) => {
        if (selectedOption) {
            setIdPessoa(selectedOption.value);
            setEnderecoRetirada(selectedOption.endereco);
            setEnderecoEntrega(selectedOption.endereco);
            setCelular(selectedOption.celular || ''); 
            setEmail(selectedOption.email || ''); 
        }
    };

    const handleNewPessoaSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase
                .from('pessoa')
                .insert([{
                    nome: searchTerm,
                    celular: celular,
                    email: email,
                    endereco: enderecoRetirada,
                }]);


            if (error) {
                setError('Erro ao adicionar nova pessoa: ' + error.message);
            } else {
                const newPessoa = data[0];
                setIdPessoa(newPessoa.id);
                setEnderecoRetirada(newPessoa.endereco);
                setEnderecoEntrega(newPessoa.endereco);
                setCelular(newPessoa.celular || '');
                setEmail(newPessoa.email || '');
                setShowNewPessoaForm(false); 
            }
        } finally {
            setShowNewPessoaForm(false)
           
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // Previne o envio do formulário com Enter
        }
    };

    // Opções de forma de pagamento
    const formaPgtoOptions = [
        { value: 1, label: 'Cartão de Crédito' },
        { value: 2, label: 'Boleto' },
        { value: 3, label: 'Transferência' },
    ];

    

    return (
        <div className="side-panel" ref={panelRef}>
            <div className="side-panel-content">
                <button className="btn btn-close" onClick={onClose}></button>
                <h2>{entrega ? 'Atualizar Entrega' : 'Inserir Entrega'}</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {!idPessoa ? (
                    <div>
                        <div className="mb-3">
                            <label htmlFor="pessoaSearch" className="form-label">Pesquisar cliente</label>
                            <input
                                type="text"
                                className="form-control"
                                id="pessoaSearch"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquise pelo nome ou telefone"
                                required
                            />
                        </div>
                        {loading && <div>Carregando...</div>}
                        {pessoas.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label">Selecione uma Pessoa</label>
                                <Select
                                    options={pessoas.map(pessoa => ({
                                        value: pessoa.idpessoa,
                                        label: pessoa.nome,
                                        endereco: pessoa.endereco,
                                        celular: pessoa.celular,
                                        email: pessoa.email
                                    }))}
                                    onChange={handlePessoaSelect}
                                    placeholder="Digite o nome ou telefone da pessoa"
                                    required
                                />
                            </div>
                        )}

                        {pessoas.length === 0 && !showNewPessoaForm && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNewPessoaForm(true)}
                            >
                                Adicionar Nova Pessoa
                            </button>
                        )}

                        {showNewPessoaForm && (
                            <form onSubmit={handleNewPessoaSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="celular" className="form-label">Celular</label>
                                    <InputMask
                                        className="form-control"
                                        mask="(99) 99999-9999"
                                        value={celular}
                                        onChange={(e) => setCelular(e.target.value)}
                                        placeholder="Digite o celular"
                                        required
                                    >
                                        {(inputProps) => <input type="text" {...inputProps} id="celular" />}
                                    </InputMask>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite o email"
                                    />
                                </div>
                                <div className="d-grid gap-2 d-md-block">
                                <button type="submit" className="btn btn-primary"> Adicionar Pessoa</button> 
                                <button type="button" className="btn btn-secondary ml-2" onClick={() => setShowNewPessoaForm(false)}>Cancelar</button>
                                </div>
                               
                            </form>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleEntregaSubmit} onKeyDown={handleKeyDown}>
                        <div className="mb-3">
                            <label htmlFor="enderecoRetirada" className="form-label">Endereço de Retirada</label>
                            <input
                                type="text"
                                className="form-control"
                                id="enderecoRetirada"
                                value={enderecoRetirada}
                                onChange={(e) => setEnderecoRetirada(e.target.value)}
                                placeholder="Digite o endereço de retirada"
                                required
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
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="descricao" className="form-label">Descrição</label>
                            <input
                                type="text"
                                className="form-control"
                                id="descricao"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Digite a descrição"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="vrCalculado" className="form-label">Valor Calculado</label>
                            <NumericFormat
                                value={vrCalculado}
                                onValueChange={(values) => setVrCalculado(values.value)}
                                className="form-control"
                                id="vrCalculado"
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                required
                        
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="idFormaPgto" className="form-label">Forma de Pagamento</label>
                            <Select
                                options={formaPgtoOptions}
                                value={formaPgtoOptions.find(option => option.value === idFormaPgto)}
                                onChange={(selectedOption) => setIdFormaPgto(selectedOption.value)}
                                placeholder="Selecione a forma de pagamento"
                                required
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
