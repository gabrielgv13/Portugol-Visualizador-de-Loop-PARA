import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, StepForward, StepBack, Info, Terminal, Database, Code2, ListTree, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Common Types
type HighlightCode = 'none' | 'init' | 'for-init' | 'for-cond' | 'for-inc' | 'for-body' | 'end';

interface TraceStep {
  step: number;
  highlightCode: HighlightCode;
  iValue: number | null;
  output: string[];
  activeIndex: number | null;
  message: string;
}

// Basic Loop Trace Data
const TRACE_BASIC: TraceStep[] = [
  { step: 0, highlightCode: 'none', iValue: null, output: [], activeIndex: null, message: "A execução ainda não começou. Navegue manualmente clicando em 'Próximo Passo'." },
  { step: 1, highlightCode: 'for-init', iValue: 0, output: [], activeIndex: null, message: "O laço PARA inicia. A variável de controle 'i' é criada e recebe o valor inicial 0." },
  { step: 2, highlightCode: 'for-cond', iValue: 0, output: [], activeIndex: null, message: "Teste Lógico: 0 é menor que 3? SIM (Verdadeiro). Portanto, entramos no bloco." },
  { step: 3, highlightCode: 'for-body', iValue: 0, output: ["Repetição número: 0"], activeIndex: null, message: "Comando executado. A mensagem é enviada ao console." },
  { step: 4, highlightCode: 'for-inc', iValue: 1, output: ["Repetição número: 0"], activeIndex: null, message: "Fim do bloco. Retornamos ao cabeçalho do PARA e acionamos o incremento (i++), aumentando 'i' para 1." },
  { step: 5, highlightCode: 'for-cond', iValue: 1, output: ["Repetição número: 0"], activeIndex: null, message: "Teste Lógico: 1 é menor que 3? SIM (Verdadeiro)." },
  { step: 6, highlightCode: 'for-body', iValue: 1, output: ["Repetição número: 0", "Repetição número: 1"], activeIndex: null, message: "Comando executado. Nova mensagem no console." },
  { step: 7, highlightCode: 'for-inc', iValue: 2, output: ["Repetição número: 0", "Repetição número: 1"], activeIndex: null, message: "Incremento acionado (i++), aumentando 'i' para 2." },
  { step: 8, highlightCode: 'for-cond', iValue: 2, output: ["Repetição número: 0", "Repetição número: 1"], activeIndex: null, message: "Teste Lógico: 2 é menor que 3? SIM (Verdadeiro)." },
  { step: 9, highlightCode: 'for-body', iValue: 2, output: ["Repetição número: 0", "Repetição número: 1", "Repetição número: 2"], activeIndex: null, message: "Comando executado. A terceira mensagem é enviada ao console." },
  { step: 10, highlightCode: 'for-inc', iValue: 3, output: ["Repetição número: 0", "Repetição número: 1", "Repetição número: 2"], activeIndex: null, message: "Incremento acionado (i++), aumentando 'i' para 3." },
  { step: 11, highlightCode: 'for-cond', iValue: 3, output: ["Repetição número: 0", "Repetição número: 1", "Repetição número: 2"], activeIndex: null, message: "Teste Lógico: 3 é menor que 3? NÃO (Falso). O limite foi atingido." },
  { step: 12, highlightCode: 'end', iValue: 3, output: ["Repetição número: 0", "Repetição número: 1", "Repetição número: 2"], activeIndex: null, message: "Como a condição foi Falsa, o programa abandona o laço PARA e finaliza sua execução." }
];

// Vector Loop Trace Data
const TRACE_VECTOR: TraceStep[] = [
  { step: 0, highlightCode: 'none', iValue: null, output: [], activeIndex: null, message: "A execução ainda não começou. Navegue manualmente clicando em 'Próximo Passo'." },
  { step: 1, highlightCode: 'init', iValue: null, output: [], activeIndex: null, message: "Declaração: É reservado espaço na memória para o vetor de 4 posições. O vetor é preenchido com {10, 4, 9, 4}." },
  { step: 2, highlightCode: 'for-init', iValue: 0, output: [], activeIndex: null, message: "O laço PARA inicia. A variável de controle 'i' é criada e recebe o valor inicial 0." },
  { step: 3, highlightCode: 'for-cond', iValue: 0, output: [], activeIndex: null, message: "Teste Lógico: 0 é menor que 4? SIM (Verdadeiro). O laço é autorizado a executar o seu bloco interno." },
  { step: 4, highlightCode: 'for-body', iValue: 0, output: ["O índice 0 contém o valor de 10"], activeIndex: 0, message: "Lemos a posição 0 do vetor (vetor[0] = 10) e a mensagem é enviada ao console." },
  { step: 5, highlightCode: 'for-inc', iValue: 1, output: ["O índice 0 contém o valor de 10"], activeIndex: null, message: "Fim do bloco. Acionamos o incremento (i++), aumentando 'i' para 1." },
  { step: 6, highlightCode: 'for-cond', iValue: 1, output: ["O índice 0 contém o valor de 10"], activeIndex: null, message: "Teste Lógico: 1 é menor que 4? SIM (Verdadeiro). Entramos novamente no bloco." },
  { step: 7, highlightCode: 'for-body', iValue: 1, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4"], activeIndex: 1, message: "Lemos a posição 1 do vetor (vetor[1] = 4) e a nova mensagem é enviada ao console." },
  { step: 8, highlightCode: 'for-inc', iValue: 2, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4"], activeIndex: null, message: "Incremento acionado de novo (i++), aumentando 'i' para 2." },
  { step: 9, highlightCode: 'for-cond', iValue: 2, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4"], activeIndex: null, message: "Teste Lógico: 2 é menor que 4? SIM (Verdadeiro)." },
  { step: 10, highlightCode: 'for-body', iValue: 2, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9"], activeIndex: 2, message: "Lemos a posição 2 do vetor (vetor[2] = 9) e mostramos na tela." },
  { step: 11, highlightCode: 'for-inc', iValue: 3, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9"], activeIndex: null, message: "Incremento acionado (i++), aumentando 'i' para 3." },
  { step: 12, highlightCode: 'for-cond', iValue: 3, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9"], activeIndex: null, message: "Teste Lógico: 3 é menor que 4? SIM (Verdadeiro). Esta será a última vez que o bloco rodará." },
  { step: 13, highlightCode: 'for-body', iValue: 3, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9", "O índice 3 contém o valor de 4"], activeIndex: 3, message: "Lemos a posição 3 do vetor (vetor[3] = 4). Neste momento o laço visitou todas as posições do vetor." },
  { step: 14, highlightCode: 'for-inc', iValue: 4, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9", "O índice 3 contém o valor de 4"], activeIndex: null, message: "Incremento acionado (i++), aumentando 'i' para 4." },
  { step: 15, highlightCode: 'for-cond', iValue: 4, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9", "O índice 3 contém o valor de 4"], activeIndex: null, message: "Teste Lógico: 4 é menor que 4? NÃO (Falso). O limite foi atingido." },
  { step: 16, highlightCode: 'end', iValue: 4, output: ["O índice 0 contém o valor de 10", "O índice 1 contém o valor de 4", "O índice 2 contém o valor de 9", "O índice 3 contém o valor de 4"], activeIndex: null, message: "Como a condição foi Falsa, o programa abandona o laço PARA e segue com as instruções." }
];

const VETOR_VALORES = [10, 4, 9, 4];

export default function App() {
  const [activeTab, setActiveTab] = useState<'basic' | 'vector'>('basic');
  const [stepIdx, setStepIdx] = useState(0);
  const consoleContentRef = useRef<HTMLDivElement>(null);

  const TRACE = activeTab === 'basic' ? TRACE_BASIC : TRACE_VECTOR;
  const currentStep = TRACE[stepIdx];

  // Reset steps when tab changes
  useEffect(() => {
    setStepIdx(0);
  }, [activeTab]);

  useEffect(() => {
    if (consoleContentRef.current) {
      consoleContentRef.current.scrollTop = consoleContentRef.current.scrollHeight;
    }
  }, [currentStep.output]);

  const handleNext = () => {
    setStepIdx((s) => Math.min(TRACE.length - 1, s + 1));
  };

  const handlePrev = () => {
    setStepIdx((s) => Math.max(0, s - 1));
  };

  const handleReset = () => {
    setStepIdx(0);
  };

  const isHl = (type: HighlightCode) => currentStep.highlightCode === type;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0 z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">P</div>
          <h1 className="text-xl font-semibold tracking-tight truncate">Portugol Studio <span className="text-slate-400 font-normal hidden md:inline">| Simulador de Laço PARA</span></h1>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2
              ${activeTab === 'basic' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Hash size={16} />
            Laço Básico
          </button>
          <button 
            onClick={() => setActiveTab('vector')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2
              ${activeTab === 'vector' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ListTree size={16} />
            Laço com Vetores
          </button>
        </div>

        <div className="flex gap-2 items-center self-end sm:self-auto">
          <button onClick={handleReset} className="px-4 py-2 hover:bg-slate-100 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 transition-colors hidden sm:block">
            Reiniciar
          </button>
          <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-md p-1 shadow-sm">
             <button onClick={handlePrev} disabled={stepIdx === 0} className="px-3 py-1.5 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-40 transition flex items-center justify-center gap-1" title="Passo Anterior">
               <StepBack size={16} /> <span className="hidden lg:inline text-sm font-medium">Voltar</span>
             </button>
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             <button onClick={handleNext} disabled={stepIdx === TRACE.length - 1} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition disabled:opacity-40 flex items-center justify-center gap-1" title="Próximo Passo">
                <span className="hidden lg:inline text-sm font-medium">Avançar</span> <StepForward size={16} />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-[1400px] w-full mx-auto overflow-y-auto">
        {/* Sidebar: Code Editor & Explanations */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-800 flex flex-col transition-all">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
               <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-500 text-xs ml-4 font-mono uppercase">programa.por</span>
               </div>
               <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">{activeTab === 'basic' ? 'Simples' : 'Vetor'}</span>
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === 'basic' ? (
                <motion.pre key="basic-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-sm leading-relaxed text-slate-300 overflow-x-auto">
                   <div className={`-mx-6 px-6 py-1 ${['for-init', 'for-cond', 'for-inc'].includes(currentStep.highlightCode) ? 'bg-blue-900/30 border-l-4 border-blue-500 text-white' : 'border-l-4 border-transparent'}`}>
                      <span className="text-purple-400">para</span> (
                      <span className={isHl('for-init') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}><span className="text-blue-400">inteiro</span> i = <span className="text-orange-400">0</span></span>; 
                      {' '}<span className={isHl('for-cond') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}>i &lt; <span className="text-orange-400">3</span></span>; 
                      {' '}<span className={isHl('for-inc') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}>i++</span>) &#123;
                   </div>
                   <div className={`-mx-6 px-6 py-1 pl-10 ${isHl('for-body') ? 'bg-blue-900/30 border-l-4 border-blue-500 text-white' : 'border-l-4 border-transparent'}`}>
                      <span className="text-slate-500 italic">// Atual: i = {currentStep.iValue !== null ? currentStep.iValue : '?'}</span>
                      <br />
                      <span className="text-yellow-200">escreva</span>(<span className="text-emerald-400">"Repetição número: "</span>, i, <span className="text-emerald-400">"\n"</span>)
                   </div>
                   <div className="-mx-6 px-6 border-l-4 border-transparent">
                      &#125;
                   </div>
                </motion.pre>
              ) : (
                <motion.pre key="vector-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-sm leading-relaxed text-slate-300 overflow-x-auto">
                   <div className={`-mx-6 px-6 py-1 ${isHl('init') ? 'bg-blue-900/30 border-l-4 border-blue-500 text-white' : 'border-l-4 border-transparent'}`}>
                      <span className="text-blue-400">inteiro</span> vetor[<span className="text-orange-400">4</span>] = &#123;<span className="text-orange-400">10, 4, 9, 4</span>&#125;
                   </div>
                   <br/>
                   <div className={`-mx-6 px-6 py-1 ${['for-init', 'for-cond', 'for-inc'].includes(currentStep.highlightCode) ? 'bg-blue-900/30 border-l-4 border-blue-500 text-white' : 'border-l-4 border-transparent'}`}>
                      <span className="text-purple-400">para</span> (
                      <span className={isHl('for-init') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}><span className="text-blue-400">inteiro</span> i = <span className="text-orange-400">0</span></span>; 
                      {' '}<span className={isHl('for-cond') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}>i &lt; <span className="text-orange-400">4</span></span>; 
                      {' '}<span className={isHl('for-inc') ? 'bg-yellow-500/20 text-yellow-200 px-1 rounded' : ''}>i++</span>) &#123;
                   </div>
                   <div className={`-mx-6 px-6 py-1 pl-10 ${isHl('for-body') ? 'bg-blue-900/30 border-l-4 border-blue-500 text-white' : 'border-l-4 border-transparent'}`}>
                      <span className="text-slate-500 italic">// Atual: i = {currentStep.iValue !== null ? currentStep.iValue : '?'}</span>
                      <br />
                      <span className="text-yellow-200">escreva</span>(<span className="text-emerald-400">"O índice "</span>, i, <span className="text-emerald-400">" contém o valor "</span>, vetor[i])
                   </div>
                   <div className="-mx-6 px-6 border-l-4 border-transparent">
                      &#125;
                   </div>
                </motion.pre>
              )}
            </AnimatePresence>
          </div>

          {/* Contextual Information Panel */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hidden sm:block">
            {activeTab === 'basic' ? (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Compreendendo o LAÇO PARA</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  A estrutura <strong>para</strong> repete um bloco de código um número definido de vezes. Ela possui 3 partes principais:
                </p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                  <li><strong>Inicialização (<code className="text-blue-600 border px-1 rounded">i = 0</code>)</strong>: Ocorre apenas na 1ª vez.</li>
                  <li><strong>Condição (<code className="text-blue-600 border px-1 rounded">i &lt; 3</code>)</strong>: Testada <em>antes</em> de cada bloco. Se Falso, o laço para de girar.</li>
                  <li><strong>Incremento (<code className="text-blue-600 border px-1 rounded">i++</code>)</strong>: Aumenta em 1 ao <em>final</em> do que já foi executado no bloco, então repete o teste lógico.</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Por que a condição é <code className="text-blue-600 font-mono">i &lt; 4</code>?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Em programação, os vetores começam no <strong>índice 0</strong>. Se o vetor tem 4 posições, seus índices são 0, 1, 2 e 3.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A condição <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200 text-slate-700">i &lt; 4</code> garante que o laço pare exatamente após processar o índice 3, evitando o erro <em>out of bounds</em> num índice 4 imaginário.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          
          {/* Status Alert */}
          <motion.div 
            key={currentStep.step}
            initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm text-blue-900 flex items-start gap-3 sm:gap-4 transition-all"
          >
             <Info size={24} className="text-blue-500 shrink-0 mt-0.5" />
             <div>
               <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700/70 mb-1 block">Contexto de Execução</span>
               <p className="text-sm leading-relaxed font-medium">{currentStep.message}</p>
             </div>
          </motion.div>

          {/* Variable Inspector */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {activeTab === 'basic' ? 'Memória: Contador' : 'Representação do Vetor'}
              </h2>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <span className="text-xs text-blue-700 font-mono">VARIÁVEL AUXILIAR:</span>
                <span className="text-blue-700 font-mono font-bold text-sm bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100 min-w-[3rem] text-center">
                  i = {currentStep.iValue !== null ? currentStep.iValue : '?'}
                </span>
              </div>
            </div>

            {activeTab === 'basic' ? (
              // Basic Loop Visualization
              <div className="flex justify-center items-center py-6">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-widest">Valor Atual de i</span>
                  <motion.div 
                    key={currentStep.iValue}
                    initial={{ scale: 1.2, backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#2563eb' }}
                    animate={{ scale: 1, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#475569' }}
                    className="w-32 h-32 rounded-3xl border-4 flex items-center justify-center text-5xl font-mono shadow-inner bg-slate-50"
                  >
                    {currentStep.iValue !== null ? currentStep.iValue : '-'}
                  </motion.div>
                </div>
              </div>
            ) : (
              // Vector Grid
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {VETOR_VALORES.map((val, idx) => {
                  const isActive = currentStep.activeIndex === idx;
                  return (
                    <div key={idx} className="flex flex-col gap-2 relative">
                      <span className={`text-center text-[10px] sm:text-xs font-mono -mb-1 z-10 ${isActive ? 'text-blue-500 font-bold uppercase' : 'text-slate-400 italic'}`}>
                        {isActive ? 'Lendo agora' : `vetor[${idx}]`}
                      </span>
                      <motion.div 
                        initial={false}
                        animate={{
                          y: isActive ? -4 : 0,
                          backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                          borderColor: isActive ? '#3b82f6' : '#f1f5f9',
                          color: isActive ? '#2563eb' : '#94a3b8'
                        }}
                        className={`h-16 md:h-20 flex items-center justify-center text-xl md:text-2xl font-bold rounded-xl ${isActive ? 'border-2 shadow-md z-0' : 'border-2'}`}
                      >
                        {currentStep.step >= 1 ? val : ''}
                      </motion.div>
                      {isActive && (
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-blue-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Execution Trace Console */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[260px]">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Saída do Console</h2>
            
            <div 
               ref={consoleContentRef}
               className="flex-1 bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm shadow-inner space-y-2 overflow-y-auto mb-5 min-h-[120px]"
            >
              {currentStep.output.length === 0 ? (
                <p className="text-neutral-500 italic font-sans text-sm">O console aguarda execuções...</p>
              ) : (
                currentStep.output.map((line, idx) => {
                   const isLatest = idx === currentStep.output.length - 1 && isHl('for-body');
                   return (
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        key={`${idx}-${line}`} 
                        className={isLatest 
                           ? 'text-emerald-400 border-l-2 border-emerald-500 pl-2 bg-emerald-900/20 animate-pulse py-0.5 font-bold' 
                           : 'text-emerald-500/70 border-l-2 border-transparent pl-2'}
                      >
                         {line}
                      </motion.p>
                   );
                })
              )}
            </div>

            {/* Step Status Grid */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 mt-auto">
              <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Passo Lógico (Inc)</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                   {currentStep.iValue !== null ? `i++ (~> ${currentStep.iValue})` : 'Aguardando...'}
                </span>
              </div>
              <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avaliação Menor Que</span>
                <span className={`text-sm font-semibold font-mono ${currentStep.iValue !== null ? (currentStep.iValue < (activeTab === 'basic' ? 3 : 4) ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                  {currentStep.iValue !== null ? `${currentStep.iValue} < ${activeTab === 'basic' ? '3' : '4'} ? ${currentStep.iValue < (activeTab === 'basic' ? 3 : 4) ? 'SIM' : 'NÃO'}` : 'Aguardando...'}
                </span>
              </div>
            </div>
            
            {/* Direct Advance Button for Mobile layout */}
             <button 
                 onClick={handleNext} 
                 disabled={stepIdx === TRACE.length - 1} 
                 className="mt-4 sm:hidden w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none inline-flex items-center justify-center gap-2"
              >
                Próximo Passo Lógico
                <StepForward size={16} />
              </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
