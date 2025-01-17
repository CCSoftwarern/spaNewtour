
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Select from 'react-select';
import './SidePanel.css';
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';
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
    const [cep, setCep] = useState('');  // Novo estado para CEP
    const [endereco, setEndereco] = useState('');  // Novo estado para endereço

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
            setCep(selectedOption.cep || '');  // Atualiza o CEP
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
                    endereco: endereco,
                    cep: cep,  // Incluindo CEP
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
                setCep(newPessoa.cep || '');  // Atualiza CEP
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

    const handleCepChange = async () => {
        // Só realizar a busca se o CEP estiver no formato correto (com 10 caracteres)
        if (cep.length === 9) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    // Atualiza o campo de endereço com os dados retornados
                    const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                    setEndereco(enderecoCompleto);
                    setEnderecoRetirada(enderecoCompleto);
                } else {
                    alert("CEP não encontrado!");
                }
            } catch (error) {
                alert("Erro ao buscar o CEP.");
            }
        } else {
            alert("Por favor, insira um CEP válido.");
        }
    };

    // Opções de forma de pagamento
    const formaPgtoOptions = [
        { value: 1, label: 'Dinheiro' },
        { value: 2, label: 'PIX da Cooperativa' },
        { value: 3, label: 'Comanda' },
        { value: 4, label: 'Pix do Motoboy' },
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
                                disabled={showNewPessoaForm} // Desabilita o campo quando for adicionar nova pessoa
                            />
                        </div>
                        {loading && <div>Carregando...</div>}
                        {pessoas.length > 0 && !showNewPessoaForm && (
                            <div className="mb-3">
                                <label className="form-label">Selecione uma Pessoa</label>
                                <Select
                                    options={pessoas.map(pessoa => ({
                                        value: pessoa.idpessoa,
                                        label: pessoa.nome + ' | ('+ pessoa.celular + ')',
                                        endereco: pessoa.endereco,
                                        celular: pessoa.celular,
                                        email: pessoa.email,
                                        cep: pessoa.cep,  // Incluindo CEP
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
                                onClick={() => {
                                    setSearchTerm(''); // Limpa o campo de pesquisa
                                    setShowNewPessoaForm(true); // Mostra o formulário de nova pessoa
                                }}
                            >
                                Adicionar Nova Pessoa
                            </button>
                        )}

                        {showNewPessoaForm && (
                            <form onSubmit={handleNewPessoaSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="nomePessoa" className="form-label">Nome da Pessoa</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nomePessoa"
                                        value={searchTerm} // Usa searchTerm para permitir a edição do nome
                                        onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o nome
                                        placeholder="Digite o nome da pessoa"
                                        required
                                    />
                                </div>
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
                                <div className="mb-3">
                                    <label htmlFor="cep" className="form-label">CEP</label>
                                    <div className="input-group">
                                        <InputMask
                                            className="form-control"
                                            mask="99999-999"
                                            value={cep}
                                            onChange={(e) => setCep(e.target.value)}
                                            placeholder="Digite o CEP"
                                            required
                                        >
                                            {(inputProps) => <input type="text" {...inputProps} id="cep" />}
                                        </InputMask>
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={handleCepChange}
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="endereco" className="form-label">Endereço</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="endereco"
                                        value={endereco}
                                        onChange={(e) => setEndereco(e.target.value)}
                                        placeholder="Endereço completo"
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2 d-md-block">
                                    <button type="submit" className="btn btn-primary">Adicionar Pessoa</button> 
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



