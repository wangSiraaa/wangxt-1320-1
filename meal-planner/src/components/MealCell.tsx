import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Tag, Tooltip } from 'antd';
import { Dish, MealSlot, AllergenConflict, RepeatWarning, ALLERGEN_LABELS, DISH_CATEGORY_LABELS } from '../types';

interface MealCellProps {
  day: number;
  slot: MealSlot;
  dishes: Dish[];
  energy: number;
  protein: number;
  hasMeat: boolean;
  hasVeggie: boolean;
  hasSoup: boolean;
  conflicts: AllergenConflict[];
  repeatWarning?: RepeatWarning;
  onRemove: (dishId: string) => void;
}

const categoryColors: Record<string, string> = {
  meat: '#ff4d4f',
  veggie: '#52c41a',
  soup: '#faad14',
};

const MealCell: React.FC<MealCellProps> = ({
  day,
  slot,
  dishes: dishList,
  energy,
  protein,
  hasMeat,
  hasVeggie,
  hasSoup,
  conflicts,
  repeatWarning,
  onRemove,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${day}-${slot}`,
    data: { day, slot },
  });

  const hasConflict = conflicts.length > 0;
  const missingCategories: string[] = [];
  if (!hasMeat) missingCategories.push('主荤');
  if (!hasVeggie) missingCategories.push('素菜');
  if (!hasSoup) missingCategories.push('汤品');
  const isIncomplete = dishList.length > 0 && missingCategories.length > 0;
  const completeCount = [hasMeat, hasVeggie, hasSoup].filter(Boolean).length;

  const conflictClassMap = new Map<string, AllergenConflict[]>();
  for (const c of conflicts) {
    const list = conflictClassMap.get(c.className) || [];
    list.push(c);
    conflictClassMap.set(c.className, list);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 110,
        padding: 8,
        borderRadius: 8,
        border: hasConflict
          ? '2px solid #ff4d4f'
          : isOver
            ? '2px dashed #1890ff'
            : '1px solid #e8e8e8',
        backgroundColor: isOver
          ? '#e6f7ff'
          : hasConflict
            ? '#fff1f0'
            : '#fafafa',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
          {energy}kcal / {protein}g蛋白
        </span>
        {isIncomplete && (
          <Tooltip title={`缺少：${missingCategories.join('、')}`}>
            <Tag color="warning" style={{ fontSize: 10, margin: 0, cursor: 'help' }}>
              {completeCount}/3
            </Tag>
          </Tooltip>
        )}
        {dishList.length > 0 && !isIncomplete && (
          <Tag color="success" style={{ fontSize: 10, margin: 0 }}>
            完整 ✓
          </Tag>
        )}
      </div>

      {dishList.length === 0 && (
        <div style={{
          color: '#ccc',
          textAlign: 'center',
          padding: '20px 0',
          fontSize: 12,
          border: '2px dashed #e8e8e8',
          borderRadius: 6,
        }}>
          拖入菜品
        </div>
      )}

      {dishList.map((dish) => {
        const dishConflicts = conflicts.filter((c) => c.dishName === dish.name);
        return (
          <div
            key={dish.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              marginBottom: 3,
              borderRadius: 4,
              backgroundColor: dishConflicts.length > 0 ? '#ffe7e7' : '#fff',
              border: dishConflicts.length > 0 ? '1px solid #ffccc7' : '1px solid #f0f0f0',
              fontSize: 12,
              borderLeft: `3px solid ${categoryColors[dish.category]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dish.name}
              </span>
              {dishConflicts.length > 0 && (
                <Tooltip
                  title={dishConflicts.map((c) => `${c.className}: ${ALLERGEN_LABELS[c.allergen]}`).join('；')}
                >
                  <Tag color="error" style={{ fontSize: 10, margin: 0, cursor: 'help', flexShrink: 0 }}>
                    过敏
                  </Tag>
                </Tooltip>
              )}
            </div>
            <span
              onClick={() => onRemove(dish.id)}
              style={{
                cursor: 'pointer',
                color: '#bbb',
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
                marginLeft: 4,
              }}
            >
              ×
            </span>
          </div>
        );
      })}

      {conflictClassMap.size > 0 && (
        <div style={{ marginTop: 6, padding: '4px 6px', backgroundColor: '#fff1f0', borderRadius: 4 }}>
          {[...conflictClassMap.entries()].map(([cls, list]) => (
            <div key={cls} style={{ fontSize: 11, color: '#cf1322', lineHeight: 1.6 }}>
              <b style={{
                backgroundColor: '#ff4d4f',
                color: '#fff',
                padding: '0 4px',
                borderRadius: 3,
                marginRight: 4,
                fontSize: 10,
              }}>
                {cls}
              </b>
              {[...new Set(list.map((c) => ALLERGEN_LABELS[c.allergen]))].join('、')}
            </div>
          ))}
        </div>
      )}

      {repeatWarning && (
        <Tooltip
          title={
            repeatWarning.type === 'exact'
              ? `连续${repeatWarning.days.length}天同一${DISH_CATEGORY_LABELS[repeatWarning.category]}：${repeatWarning.dishNames.join('、')}`
              : `连续${repeatWarning.days.length}天同类${repeatWarning.tag}主菜：${repeatWarning.dishNames.join('、')}`
          }
        >
          <div
            style={{
              marginTop: 6,
              padding: '3px 8px',
              borderRadius: 4,
              backgroundColor: repeatWarning.type === 'exact' ? '#fff1f0' : '#fff7e6',
              border: `1px solid ${repeatWarning.type === 'exact' ? '#ffa39e' : '#ffd591'}`,
              fontSize: 11,
              color: repeatWarning.type === 'exact' ? '#cf1322' : '#d48806',
              cursor: 'help',
            }}
          >
            {repeatWarning.type === 'exact' ? '🔴 ' : '⚠ '}
            {repeatWarning.type === 'exact'
              ? '连续重复同一菜'
              : `连续同类(${repeatWarning.tag})`}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default MealCell;
