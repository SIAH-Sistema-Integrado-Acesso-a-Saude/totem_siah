import { useState, useMemo } from 'react';

const maskCPF = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

const onlyLetters = (value) =>
  value.replace(/[0-9!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/g, '');

const maskPhone = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');

const calcularIdade = (data) => {
  if (!data) return 0;
  const hoje = new Date();
  const nascimento = new Date(data);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  rg: '',
  email: '',
  telefone: '',
  data_nascimento: '',
  genero: '',
  tipo_sanguineo: '',
  hospital_vinculado: '',
  cartao_sus: '',
  cnh: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  possui_plano_saude: false,
  nome_plano: '',
  numero_carteirinha: '',
  validade_carteirinha: '',
  nome_responsavel: '',
  parentesco: '',
  telefone_responsavel: '',
};

export default function CadastroForm({ initialData, password, statusMessage, capturedImages, onSubmit, onReset }) {
  const initial = useMemo(() => {
    const src = initialData ?? {};
    const pick = (snake, camel) => src[snake] ?? src[camel] ?? '';
    const merged = {
      ...EMPTY_FORM,
      nome: pick('nome', 'nome'),
      cpf: pick('cpf', 'cpf'),
      email: pick('email', 'email'),
      telefone: pick('telefone', 'telefone'),
      data_nascimento: pick('data_nascimento', 'dataNascimento'),
      genero: pick('genero', 'genero'),
      tipo_sanguineo: pick('tipo_sanguineo', 'tipoSanguineo'),
      hospital_vinculado: pick('hospital_vinculado', 'hospitalVinculado'),
      rg: pick('rg', 'rg'),
      cartao_sus: pick('cartao_sus', 'cartaoSus'),
      cnh: pick('cnh', 'cnh'),
      cep: pick('cep', 'cep'),
      rua: pick('rua', 'rua'),
      numero: pick('numero', 'numero'),
      bairro: pick('bairro', 'bairro'),
      cidade: pick('cidade', 'cidade'),
      estado: pick('estado', 'estado'),
      possui_plano_saude: src.possui_plano_saude ?? src.possuiPlanoSaude ?? false,
      nome_plano: pick('nome_plano', 'nomePlano'),
      numero_carteirinha: pick('numero_carteirinha', 'numeroCarteirinha'),
      validade_carteirinha: pick('validade_carteirinha', 'validadeCarteirinha'),
      nome_responsavel: pick('nome_responsavel', 'nomeResponsavel'),
      parentesco: pick('parentesco', 'parentesco'),
      telefone_responsavel: pick('telefone_responsavel', 'telefoneResponsavel'),
    };
    if (merged.cpf) merged.cpf = maskCPF(String(merged.cpf));
    if (merged.telefone) merged.telefone = maskPhone(String(merged.telefone));
    if (merged.telefone_responsavel) merged.telefone_responsavel = maskPhone(String(merged.telefone_responsavel));
    return merged;
  }, [initialData]);

  const [formData, setFormData] = useState(initial);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    let v = value;
    if (name === 'nome' || name === 'nome_responsavel') v = onlyLetters(value).substring(0, 100);
    if (name === 'cpf') v = maskCPF(value);
    if (name === 'telefone' || name === 'telefone_responsavel') v = maskPhone(value);
    if (name === 'email' || name === 'hospital_vinculado') v = value.substring(0, 80);
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cpf.length < 14) {
      alert('Preencha o CPF completo.');
      return;
    }
    setEnviando(true);
    try {
      const idade = calcularIdade(formData.data_nascimento);
      const maior = idade >= 18;
      const dateOrNull = (v) => (v && v.length ? v : null);
      const validade = formData.possui_plano_saude ? dateOrNull(formData.validade_carteirinha) : null;
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        dataNascimento: dateOrNull(formData.data_nascimento),
        genero: formData.genero,
        tipoSanguineo: formData.tipo_sanguineo,
        hospitalVinculado: formData.hospital_vinculado,
        rg: formData.rg,
        cartaoSus: formData.cartao_sus,
        cnh: formData.cnh,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        possuiPlanoSaude: !!formData.possui_plano_saude,
        nomePlano: formData.possui_plano_saude ? formData.nome_plano : '',
        numeroCarteirinha: formData.possui_plano_saude ? formData.numero_carteirinha : '',
        validadeCarteirinha: validade,
        nomeResponsavel: maior ? '' : formData.nome_responsavel,
        parentesco: maior ? '' : formData.parentesco,
        telefoneResponsavel: maior ? '' : formData.telefone_responsavel.replace(/\D/g, ''),
        images: Array.isArray(capturedImages) ? capturedImages : [],
        embedding: [],
        embeddingPath: '',
        tempFile: '',
      };
      await onSubmit(payload);
    } finally {
      setEnviando(false);
    }
  };

  const idade = calcularIdade(formData.data_nascimento);
  const menorIdade = idade < 18 && formData.data_nascimento !== '';

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Cadastro</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#162033]">
            {initialData ? 'Confirme seus dados' : 'Complete seu cadastro'}
          </h2>
        </div>
        <button onClick={onReset} className="text-sm font-semibold text-[#0b2540] hover:underline">
          Reiniciar
        </button>
      </div>

      {password ? (
        <div className="mb-6 rounded-[20px] border border-[#d1fae5] bg-[#ecfdf5] p-4 text-center">
          <p className="text-xs text-[#0f766e]">Sua senha</p>
          <p className="mt-1 text-2xl font-bold text-[#064e3b]">{password}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-semibold text-[#06a08b]">Identificação Básica</h3>

        <Field label="Nome Completo">
          <input
            name="nome"
            value={formData.nome}
            placeholder="João da Silva"
            onChange={handleChange}
            maxLength={100}
            required
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CPF">
            <input
              name="cpf"
              value={formData.cpf}
              placeholder="123.456.789-00"
              onChange={handleChange}
              maxLength={14}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Data de Nascimento">
            <input
              name="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleChange}
              min="1900-01-01"
              max="9999-12-31"
              required
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Telefone do Paciente">
          <input
            name="telefone"
            value={formData.telefone}
            placeholder="(00) 00000-0000"
            onChange={handleChange}
            maxLength={15}
            required
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gênero">
            <select name="genero" value={formData.genero} onChange={handleChange} className={inputCls}>
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </Field>
          <Field label="Tipo Sanguíneo">
            <select name="tipo_sanguineo" value={formData.tipo_sanguineo} onChange={handleChange} className={inputCls}>
              <option value="">Selecione</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="RG">
            <input name="rg" value={formData.rg} onChange={handleChange} maxLength={20} className={inputCls} />
          </Field>
          <Field label="Cartão SUS">
            <input name="cartao_sus" value={formData.cartao_sus} onChange={handleChange} maxLength={20} className={inputCls} />
          </Field>
          <Field label="CNH">
            <input name="cnh" value={formData.cnh} onChange={handleChange} maxLength={20} className={inputCls} />
          </Field>
        </div>

        <hr className="border-t border-slate-100" />
        <h3 className="text-sm font-semibold text-[#06a08b]">Endereço</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="CEP">
            <input name="cep" value={formData.cep} onChange={handleChange} maxLength={9} className={inputCls} />
          </Field>
          <Field label="Cidade">
            <input name="cidade" value={formData.cidade} onChange={handleChange} maxLength={60} className={inputCls} />
          </Field>
          <Field label="Estado">
            <input name="estado" value={formData.estado} onChange={handleChange} maxLength={2} placeholder="SP" className={inputCls} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rua">
            <input name="rua" value={formData.rua} onChange={handleChange} maxLength={100} className={`${inputCls} sm:col-span-2`} />
          </Field>
          <Field label="Número">
            <input name="numero" value={formData.numero} onChange={handleChange} maxLength={10} className={inputCls} />
          </Field>
          <Field label="Bairro">
            <input name="bairro" value={formData.bairro} onChange={handleChange} maxLength={60} className={inputCls} />
          </Field>
        </div>

        <hr className="border-t border-slate-100" />
        <h3 className="text-sm font-semibold text-[#06a08b]">Plano de Saúde</h3>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="possui_plano_saude"
            checked={!!formData.possui_plano_saude}
            onChange={handleChange}
            className="h-4 w-4 accent-[#35D9C8]"
          />
          <span className="text-sm font-medium text-[#374151]">Possuo plano de saúde</span>
        </label>

        {formData.possui_plano_saude && (
          <div className="grid gap-4 sm:grid-cols-3 rounded-[12px] border-l-4 border-[#35D9C8] bg-[#f8fafc] p-5">
            <Field label="Nome do Plano">
              <input name="nome_plano" value={formData.nome_plano} onChange={handleChange} maxLength={60} className={inputCls} />
            </Field>
            <Field label="Carteirinha">
              <input name="numero_carteirinha" value={formData.numero_carteirinha} onChange={handleChange} maxLength={30} className={inputCls} />
            </Field>
            <Field label="Validade">
              <input name="validade_carteirinha" type="date" value={formData.validade_carteirinha} onChange={handleChange} className={inputCls} />
            </Field>
          </div>
        )}

        {menorIdade && (
          <div className="rounded-[12px] border-l-4 border-[#35D9C8] bg-[#f8fafc] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#06a08b]">Dados do Responsável</h3>
            <Field label="Nome do Responsável">
              <input
                name="nome_responsavel"
                value={formData.nome_responsavel}
                placeholder="Nome do tutor"
                onChange={handleChange}
                maxLength={100}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Telefone do Responsável">
              <input
                name="telefone_responsavel"
                value={formData.telefone_responsavel}
                placeholder="(00) 00000-0000"
                onChange={handleChange}
                maxLength={15}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Parentesco">
              <input
                name="parentesco"
                value={formData.parentesco}
                placeholder="Pai, Mãe, Tutor..."
                onChange={handleChange}
                maxLength={40}
                required
                className={inputCls}
              />
            </Field>
          </div>
        )}

        <hr className="border-t border-slate-100" />
        <h3 className="text-sm font-semibold text-[#06a08b]">Contato e Unidade</h3>

        <Field label="E-mail (Opcional)">
          <input
            name="email"
            type="email"
            value={formData.email}
            placeholder="contato@email.com"
            onChange={handleChange}
            maxLength={80}
            className={inputCls}
          />
        </Field>

        <Field label="Unidade Hospitalar">
          <input
            name="hospital_vinculado"
            value={formData.hospital_vinculado}
            placeholder="Unidade de atendimento"
            onChange={handleChange}
            maxLength={80}
            required
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={enviando}
          className="mt-2 w-full rounded-[16px] bg-gradient-to-br from-[#35D9C8] to-[#2bc4b4] px-6 py-4 text-base font-semibold text-white transition disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Finalizar cadastro'}
        </button>

        {statusMessage ? (
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs font-medium text-[#b91c1c]">
            {statusMessage}
          </pre>
        ) : null}
      </form>
    </div>
  );
}

const inputCls =
  'rounded-[8px] border-[1.5px] border-slate-200 bg-white px-3 py-2.5 text-[#1e293b] outline-none transition focus:border-[#35D9C8] focus:ring-2 focus:ring-[#35D9C8]/20';

function Field({ label, children }) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-sm font-semibold text-[#374151]">{label}</span>
      {children}
    </label>
  );
}
