import React, { useState, useEffect, useMemo } from 'react';
import { Search, Copy, Home, Wrench, Settings, Loader2, Check } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import Papa from 'papaparse';

// Ссылка на вашу опубликованную Google Таблицу (CSV)
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLvAMU_aedXIh-bIf8WfGBFDG-E2yBCh1MQ4SvyDgGznfRp0lotEnqWsf8EQi8lzIptoMJqgHrsbdv/pub?gid=0&single=true&output=csv';

interface StatusItem {
  id: string;
  title: string;
  action: string;
}

export default function App() {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Загрузка данных из Google Sheets
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error('Ошибка сети при загрузке таблицы');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as any[];
            // Парсим колонки динамически, чтобы не зависеть от точного названия столбца
            const parsedStatuses = data.map((row) => {
              const keys = Object.keys(row);
              return {
                id: row[keys[0]]?.trim(),
                title: row[keys[1]]?.trim(),
                action: row[keys[2]]?.trim(),
              };
            }).filter(item => item.id); // Убираем пустые строки

            setStatuses(parsedStatuses);
            setLoading(false);
          },
          error: (err: any) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err: any) {
        setError('Не удалось подключиться к базе данных. Проверьте ссылку.');
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  // Фильтрация статусов
  const filteredStatuses = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return statuses.filter(
      (s) =>
        s.id.toLowerCase().includes(lowerQuery) ||
        s.title.toLowerCase().includes(lowerQuery) ||
        s.action.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, statuses]);

  // Копирование статуса
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Рендер кнопки меню
  const NavButton = ({ id, icon: Icon }: { id: string, icon: any }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setSearchQuery(''); }}
        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50' 
            : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden">
      
      {/* Боковое меню */}
      <div className="w-[72px] border-r border-zinc-800/50 flex flex-col items-center py-6 shrink-0 bg-[#09090b] z-20">
        <div className="flex flex-col gap-3 flex-1">
          <NavButton id="home" icon={Home} />
          <NavButton id="tools" icon={Wrench} />
        </div>
        <NavButton id="settings" icon={Settings} />
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Экран загрузки */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b] z-50">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-600 mb-4" />
            <p className="text-zinc-500 text-sm">Синхронизация с таблицей...</p>
          </div>
        )}

        {/* Экран ошибки */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* Заглушки для других вкладок */}
        {activeTab !== 'home' && !loading && (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Здесь будет интерфейс {activeTab === 'tools' ? 'Инструментов и Выделителя ШК' : 'Настроек'}
          </div>
        )}

        {/* Главный экран: Поиск и База статусов */}
        {activeTab === 'home' && !loading && !error && (
          <div className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-8 flex flex-col">
            
            {/* Строка поиска с динамическим позиционированием */}
            <div 
              className={`w-full transition-all duration-500 ease-out flex-shrink-0 ${
                searchQuery ? 'pt-8 pb-6' : 'pt-[35vh]'
              }`}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-zinc-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите код статуса (например, AIP) или операцию..."
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-14 pr-16 text-lg text-gray-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors shadow-sm"
                  autoFocus
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <kbd className="hidden sm:inline-flex bg-zinc-800 text-zinc-400 rounded px-2.5 py-1 text-xs font-semibold border border-zinc-700/50">
                    /
                  </kbd>
                </div>
              </div>
              
              {!searchQuery && (
                <p className="text-center mt-6 text-sm text-zinc-500 animate-in fade-in duration-700">
                  База регламентов склада мгновенно обновится при наборе текста
                </p>
              )}
            </div>

            {/* Виртуализированный список карточек */}
            {searchQuery && (
              <div className="flex-1 w-full pb-8">
                {filteredStatuses.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">
                    Статус не найден
                  </div>
                ) : (
                  <Virtuoso
                    className="w-full h-full custom-scrollbar"
                    data={filteredStatuses}
                    itemContent={(_, status) => (
                      <div className="pb-4">
                        <div className="group bg-[#0f0f13] border border-zinc-800/60 rounded-2xl p-5 hover:bg-zinc-900/80 hover:border-zinc-700 transition-colors duration-200 flex flex-col gap-3 relative overflow-hidden">
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-fuchsia-400 tracking-wide">
                                #{status.id}
                              </h3>
                              <button
                                onClick={() => handleCopy(status.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-all focus:opacity-100"
                                title="Скопировать тег"
                              >
                                {copiedId === status.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                              </button>
                            </div>
                            
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                              {status.title.toLowerCase().includes('приемк') ? 'Приемка' : 'Операция'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-zinc-200 font-medium text-base mb-1.5">{status.title}</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-wrap">
                              {status.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
