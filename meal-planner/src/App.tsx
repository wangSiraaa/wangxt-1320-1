import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Dish } from './types';
import DishCard from './components/DishCard';
import DishPalette from './components/DishPalette';
import WeekBoard from './components/WeekBoard';
import NutritionSummaryPanel from './components/NutritionSummaryPanel';
import PrintHeader from './components/PrintHeader';
import { useWeekMenu } from './hooks/useWeekMenu';

const App: React.FC = () => {
  const menuHook = useWeekMenu();
  const { addDish, clearAll, getAllergenConflicts, getRepeatWarnings } = menuHook;
  const [activeDish, setActiveDish] = useState<Dish | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const dish = event.active.data.current as Dish;
    setActiveDish(dish);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDish(null);
    const { active, over } = event;
    if (!over) return;

    const dish = active.data.current as Dish;
    const overData = over.data.current as { day: number; slot: 'breakfast' | 'lunch' | 'dinner' } | undefined;

    if (dish && overData && typeof overData.day === 'number' && overData.slot) {
      addDish(overData.day, overData.slot, dish);
    }
  };

  const conflicts = getAllergenConflicts();
  const repeats = getRepeatWarnings();

  return (
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
          <PrintHeader onClear={clearAll} />

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ flex: 1, display: 'flex', gap: 12, padding: '0 16px 16px', overflow: 'hidden' }}>
              <DishPalette />

              <div className="print-area" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
                <WeekBoard menuHook={menuHook} />
              </div>

              <NutritionSummaryPanel
                conflicts={conflicts}
                repeats={repeats}
                weekMenu={menuHook.weekMenu}
                getNutritionSummary={menuHook.getNutritionSummary}
              />
            </div>

            <DragOverlay>
              {activeDish ? <DishCard dish={activeDish} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
