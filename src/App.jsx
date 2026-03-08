import React, { useState, useEffect } from 'react';
import { RotateCcw, Info, Trash2, Plus, X, Edit2, Check, Puzzle, Wrench, ArrowRightCircle, ArrowLeftRight } from 'lucide-react';

export default function App() {
  const defaultBlocks = [
    { id: 'v_init', label: 'v', zone: 'LN', color: 'bg-blue-500' },
    { id: 'l_init', label: 'l', zone: 'RN', color: 'bg-emerald-500' },
    { id: 't_init', label: 't', zone: 'RD', color: 'bg-rose-500' }
  ];

  const [blocks, setBlocks] = useState(defaultBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [addingToZone, setAddingToZone] = useState(null);
  const [newBlockLabel, setNewBlockLabel] = useState("");

  const [activeTab, setActiveTab] = useState('constructor');
  const [puzzleTarget, setPuzzleTarget] = useState(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  const customColors = [
    'bg-amber-500', 'bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 
    'bg-orange-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const diagonals = {
    LN: 'RD',
    LD: 'RN',
    RN: 'LD',
    RD: 'LN',
  };

  const flipEquation = () => {
    if (puzzleSolved) return;
    setBlocks(blocks.map(b => {
      let newZone = b.zone;
      if (b.zone === 'LN') newZone = 'RN';
      else if (b.zone === 'RN') newZone = 'LN';
      else if (b.zone === 'LD') newZone = 'RD';
      else if (b.zone === 'RD') newZone = 'LD';
      return { ...b, zone: newZone };
    }));
    setSelectedBlockId(null);
  };

  const puzzleFormulas = [
    { id: 'f1', blocks: [{ label: 'v', zone: 'LN' }, { label: 's', zone: 'RN' }, { label: 't', zone: 'RD' }] },
    { id: 'f2', blocks: [{ label: 'T', zone: 'LN' }, { label: 't', zone: 'RN' }, { label: 'N', zone: 'RD' }] },
    { id: 'f3', blocks: [{ label: 'n', zone: 'LN' }, { label: 'N', zone: 'RN' }, { label: 't', zone: 'RD' }] },
    { id: 'f4', blocks: [{ label: 'ρ', zone: 'LN' }, { label: 'm', zone: 'RN' }, { label: 'V', zone: 'RD' }] },
    { id: 'f5', blocks: [{ label: 'p', zone: 'LN' }, { label: 'm', zone: 'RN' }, { label: 'v', zone: 'RN' }] },
    { id: 'f6', blocks: [{ label: 'F', zone: 'LN' }, { label: 'm', zone: 'RN' }, { label: 'g', zone: 'RN' }] },
    { id: 'f7', blocks: [{ label: 'F', zone: 'LN' }, { label: 'k', zone: 'RN' }, { label: 'x', zone: 'RN' }] },
    { id: 'f8', blocks: [{ label: 'F', zone: 'LN' }, { label: 'μ', zone: 'RN' }, { label: 'N', zone: 'RN' }] },
    { id: 'f9', blocks: [{ label: 'F', zone: 'LN' }, { label: 'p', zone: 'RN' }, { label: 'S', zone: 'RN' }] },
    { id: 'f10', blocks: [{ label: 'p', zone: 'LN' }, { label: 'ρ', zone: 'RN' }, { label: 'g', zone: 'RN' }, { label: 'h', zone: 'RN' }] }
  ];

  const loadRandomPuzzle = () => {
    const formula = puzzleFormulas[Math.floor(Math.random() * puzzleFormulas.length)];
    const targetChoices = formula.blocks.slice(1);
    const target = targetChoices[Math.floor(Math.random() * targetChoices.length)].label;

    const coloredBlocks = formula.blocks.map((b, i) => ({
      ...b,
      id: `puzzle_${b.label}_${Date.now()}_${i}`,
      color: customColors[i % customColors.length]
    }));

    setBlocks(coloredBlocks);
    setPuzzleTarget(target);
    setPuzzleSolved(false);
    setIsEditMode(false);
    setSelectedBlockId(null);
    setAddingToZone(null);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'puzzles') {
      loadRandomPuzzle();
    } else {
      resetToDefault();
    }
  };

  useEffect(() => {
    if (activeTab === 'puzzles' && puzzleTarget) {
      const targetBlocks = blocks.filter(b => b.label === puzzleTarget);
      if (targetBlocks.length === 1) {
        const tz = targetBlocks[0].zone;
        if (tz === 'LN') {
          const numBlocks = blocks.filter(b => b.zone === 'LN');
          const denBlocks = blocks.filter(b => b.zone === 'LD');

          if (numBlocks.length === 1 && numBlocks[0].label === puzzleTarget && denBlocks.length === 0) {
            setPuzzleSolved(true);
          } else {
            setPuzzleSolved(false);
          }
        } else {
          setPuzzleSolved(false);
        }
      }
    }
  }, [blocks, activeTab, puzzleTarget]);

  const handleBlockClick = (id) => {
    if (puzzleSolved) return;
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    } else {
      setSelectedBlockId(id);
    }
  };

  const handleZoneClick = (zoneName) => {
    if (puzzleSolved) return;
    if (selectedBlockId) {
      const block = blocks.find(b => b.id === selectedBlockId);
      if (block && diagonals[block.zone] === zoneName) {
        moveVariable(selectedBlockId, zoneName);
      }
    }
  };

  const handleDragStart = (e, id) => {
    if (puzzleSolved) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', id);
    setSelectedBlockId(id);
  };

  const handleDragOver = (e, zoneName) => {
    if (puzzleSolved) return;
    if (selectedBlockId) {
      const block = blocks.find(b => b.id === selectedBlockId);
      if (block && diagonals[block.zone] === zoneName) {
        e.preventDefault();
      }
    }
  };

  const handleDrop = (e, zoneName) => {
    if (puzzleSolved) return;
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const block = blocks.find(b => b.id === id);
    if (block && diagonals[block.zone] === zoneName) {
      moveVariable(id, zoneName);
    }
  };

  const moveVariable = (id, targetZone) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, zone: targetZone } : b));
    setSelectedBlockId(null);
  };

  const removeBlock = (e, id) => {
    e.stopPropagation();
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const resetToDefault = () => {
    setBlocks(defaultBlocks);
    setSelectedBlockId(null);
    setAddingToZone(null);
  };

  const clearBoard = () => {
    setBlocks([]);
    setSelectedBlockId(null);
    setAddingToZone(null);
  };

  const handleAddSubmit = (e, zoneName) => {
    e.preventDefault();
    if (newBlockLabel.trim() !== "") {
      const newId = `custom_${Date.now()}`;
      const color = customColors[blocks.length % customColors.length];
      setBlocks([...blocks, { id: newId, label: newBlockLabel.trim(), zone: zoneName, color }]);
    }
    setAddingToZone(null);
    setNewBlockLabel("");
  };

  const renderFormattedEquation = () => {
    const renderSide = (numZone, denZone) => {
      const numBlocks = blocks.filter(b => b.zone === numZone).map(b => b.label);
      const denBlocks = blocks.filter(b => b.zone === denZone).map(b => b.label);
      
      const formatLabel = (lbl) => {
        if ((lbl.includes('+') || lbl.includes('-')) && !lbl.startsWith('(')) {
          return `(${lbl})`;
        }
        return lbl;
      };

      const nStr = numBlocks.length ? numBlocks.map(formatLabel).join(' · ') : '1';
      const dStr = denBlocks.length ? denBlocks.map(formatLabel).join(' · ') : '1';
      
      if (dStr === '1') {
        return <span>{nStr}</span>;
      }

      return (
        <div className="inline-flex flex-col items-center justify-center mx-2 align-middle">
          <span className="border-b-[3px] border-white/80 px-2 pb-1 text-center min-w-[2rem] leading-none">{nStr}</span>
          <span className="px-2 pt-2 text-center min-w-[2rem] leading-none">{dStr}</span>
        </div>
      );
    };

    return (
      <div className="flex items-center justify-center gap-3">
        {renderSide('LN', 'LD')}
        <span>=</span>
        {renderSide('RN', 'RD')}
      </div>
    );
  };

  const renderZone = (zoneName, label) => {
    const varsInZone = blocks.filter((b) => b.zone === zoneName);
    
    let isValidTarget = false;
    let isSource = false;
    
    if (selectedBlockId) {
      const selectedBlock = blocks.find(b => b.id === selectedBlockId);
      if (selectedBlock) {
        isValidTarget = diagonals[selectedBlock.zone] === zoneName;
        isSource = selectedBlock.zone === zoneName;
      }
    }

    return (
      <div
        onClick={() => handleZoneClick(zoneName)}
        onDragOver={(e) => handleDragOver(e, zoneName)}
        onDrop={(e) => handleDrop(e, zoneName)}
        className={`relative min-h-[90px] min-w-[130px] md:min-w-[180px] p-2 md:p-3 rounded-2xl flex flex-wrap items-center justify-center gap-2 transition-all duration-300 ${
          isValidTarget
            ? 'border-4 border-emerald-400 bg-emerald-50 cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-pulse'
            : isSource 
            ? 'border-2 border-indigo-200 bg-slate-50'
            : 'border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white/50'
        }`}
      >
        {varsInZone.length === 0 && addingToZone !== zoneName && (
          <span className="text-slate-300 italic font-serif text-3xl select-none absolute">1</span>
        )}

        {varsInZone.map((block, idx) => (
          <React.Fragment key={block.id}>
            {idx > 0 && <span className="text-2xl font-bold text-slate-400">·</span>}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onClick={(e) => {
                e.stopPropagation();
                handleBlockClick(block.id);
              }}
              className={`relative group px-3 min-w-[50px] h-12 md:h-14 rounded-2xl flex flex-col items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-105 ${block.color} ${selectedBlockId === block.id ? 'ring-4 ring-offset-4 ring-indigo-500 scale-110 shadow-indigo-200/50 z-10' : 'z-0'}`}
            >
              <span className="truncate max-w-[100px]">{block.label}</span>
              
              {isEditMode && (
                <button 
                  onClick={(e) => removeBlock(e, block.id)}
                  className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-md"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </React.Fragment>
        ))}

        {isEditMode && (
          addingToZone === zoneName ? (
            <form onSubmit={(e) => handleAddSubmit(e, zoneName)} className="flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
              <span className={varsInZone.length > 0 ? "text-2xl font-bold text-slate-400" : "hidden"}>·</span>
              <input
                autoFocus
                type="text"
                value={newBlockLabel}
                onChange={(e) => setNewBlockLabel(e.target.value)}
                placeholder="(x+y)"
                className="w-24 h-10 px-2 text-base font-bold text-slate-700 bg-white border-2 border-indigo-400 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner"
                onBlur={() => {
                  if(!newBlockLabel) setAddingToZone(null);
                }}
              />
            </form>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setAddingToZone(zoneName);
                setNewBlockLabel("");
              }}
              className={`z-10 w-8 h-8 rounded-full border-2 border-dashed border-slate-400 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 hover:border-slate-500 transition-colors ${varsInZone.length === 0 ? 'opacity-0 hover:opacity-100' : ''}`}
              title="Додати нову змінну або блок"
            >
              <Plus size={16} />
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-4 flex flex-col items-center font-sans">
      
      <div className="flex flex-wrap justify-center gap-2 bg-slate-200/70 p-1 rounded-2xl mb-3 shadow-inner">
        <button 
          onClick={() => switchTab('constructor')} 
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all duration-200 text-sm md:text-base ${activeTab === 'constructor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Wrench size={18} /> Конструктор
        </button>
        <button 
          onClick={() => switchTab('puzzles')} 
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all duration-200 text-sm md:text-base ${activeTab === 'puzzles' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          <Puzzle size={18} /> Пазли
        </button>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 mb-4 text-center">
        {activeTab === 'constructor' ? (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Конструктор Формул</h1>
            <p className="text-slate-600 text-sm md:text-md mb-3">
              {isEditMode ? (
                <>
                  <strong>Режим редагування:</strong> Натисніть <strong className="font-bold">+</strong> для додавання змінних. Наведіть на блок, щоб видалити.
                </>
              ) : (
                <>
                  Перетягуйте множники через знак <strong className="text-slate-800">=</strong>, щоб переміщати їх. Кнопка <strong className="font-bold">⇄</strong> над дорівнює віддзеркалює формулу.
                </>
              )}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 mb-3">
            <h1 className="text-2xl font-bold text-slate-800">Фізичні Пазли</h1>
            <div className="bg-amber-100 border-2 border-amber-300 text-amber-800 text-lg md:text-xl font-bold px-5 py-2 rounded-xl shadow-sm flex items-center gap-2">
              Завдання: виразіть <strong className="text-2xl text-amber-600">{puzzleTarget}</strong>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 p-2 md:p-3 rounded-xl inline-flex font-medium text-xs md:text-sm">
          <Info size={16} />
          {activeTab === 'puzzles'
            ? "Залиште потрібну змінну саму в чисельнику ліворуч."
            : isEditMode 
              ? "Налаштуйте формулу та натисніть 'Зберегти та грати'."
              : selectedBlockId 
                ? "Тепер натисніть або перетягніть у підсвічену зону."
                : "Перетягніть блок у діагональну зону або віддзеркальте формулу."}
        </div>
      </div>

      <div className={`mb-4 p-3 text-white rounded-2xl shadow-lg min-w-[280px] md:min-w-[320px] text-center transform transition-all border-b-4 ${puzzleSolved ? 'bg-emerald-900 border-emerald-400 shadow-emerald-500/30' : 'bg-slate-800 border-indigo-500'}`}>
        <div className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1 ${puzzleSolved ? 'text-emerald-300' : 'text-slate-400'}`}>
          {puzzleSolved ? 'Знайдена фізична формула' : 'Поточна фізична формула'}
        </div>
        <div className="text-2xl md:text-3xl font-mono tracking-widest min-h-[60px] flex items-center justify-center">{renderFormattedEquation()}</div>
      </div>

      <div className={`relative flex flex-col items-center bg-white rounded-3xl shadow-xl border w-full max-w-4xl overflow-hidden transition-all duration-500 ${puzzleSolved ? 'border-emerald-400 shadow-emerald-200/50' : 'border-slate-100'}`}>
        
        {activeTab === 'puzzles' && puzzleSolved && (
          <div className="w-full bg-emerald-500 text-white py-2 px-6 flex items-center justify-center gap-2 shadow-sm z-10 absolute top-0 left-0 right-0">
            <Check size={20} />
            <h2 className="text-lg md:text-xl font-black tracking-wide">Формулу знайдено!</h2>
          </div>
        )}

        <div className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-4 md:p-6 w-full transition-all duration-500 ${puzzleSolved ? 'grayscale opacity-60 bg-slate-50 pointer-events-none pt-12' : ''}`}>
          
          <div className="flex flex-col items-center gap-3">
            {renderZone('LN', 'Чисельник')}
            <div className="w-full h-2 bg-slate-800 rounded-full opacity-90"></div>
            {renderZone('LD', 'Знаменник')}
          </div>

          <div className="flex flex-col items-center justify-center mx-2 md:mx-4 relative">
            <button
              onClick={flipEquation}
              disabled={puzzleSolved}
              className="mb-2 p-2 rounded-full border-2 border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all focus:outline-none"
              title="Віддзеркалити формулу"
            >
              <ArrowLeftRight size={20} />
            </button>
            <div className="text-5xl font-black text-slate-800 leading-none pb-2">
              =
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            {renderZone('RN', 'Чисельник')}
            <div className="w-full h-2 bg-slate-800 rounded-full opacity-90"></div>
            {renderZone('RD', 'Знаменник')}
          </div>
          
        </div>

      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3 pb-4">
        {activeTab === 'constructor' ? (
          <>
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setAddingToZone(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm ${
                isEditMode 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200/50' 
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200/50'
              }`}
            >
              {isEditMode ? <><Check size={18} /> Зберегти та грати</> : <><Edit2 size={18} /> Редагувати формулу</>}
            </button>

            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors text-sm"
            >
              <RotateCcw size={18} />
              Скинути
            </button>
            
            {isEditMode && (
              <button
                onClick={clearBoard}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-semibold transition-colors text-sm"
              >
                <Trash2 size={18} />
                Очистити
              </button>
            )}
          </>
        ) : (
          <button
            onClick={loadRandomPuzzle}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-md shadow-indigo-200/50 transition-all hover:scale-105"
          >
            <ArrowRightCircle size={20} />
            Нове завдання
          </button>
        )}
      </div>

    </div>
  );
}
