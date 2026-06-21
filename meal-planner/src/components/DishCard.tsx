import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tag } from 'antd';
import { Dish, DISH_CATEGORY_LABELS, ALLERGEN_LABELS } from '../types';

interface DishCardProps {
  dish: Dish;
}

const categoryColors: Record<string, string> = {
  meat: '#ff4d4f',
  veggie: '#52c41a',
  soup: '#faad14',
};

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `dish-${dish.id}`,
    data: dish,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        padding: '6px 10px',
        marginBottom: 6,
        borderRadius: 6,
        border: `1px solid ${categoryColors[dish.category]}40`,
        backgroundColor: isDragging ? '#f0f0f0' : '#fff',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>{dish.name}</span>
        <Tag color={categoryColors[dish.category]} style={{ margin: 0, fontSize: 11 }}>
          {DISH_CATEGORY_LABELS[dish.category]}
        </Tag>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, color: '#888', fontSize: 12 }}>
        <span>{dish.energy}kcal</span>
        <span>{dish.protein}g蛋白</span>
      </div>
      {dish.allergens.length > 0 && (
        <div style={{ marginTop: 3 }}>
          {dish.allergens.map((a) => (
            <Tag key={a} color="orange" style={{ fontSize: 10, margin: '0 2px', padding: '0 4px' }}>
              {ALLERGEN_LABELS[a]}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

export default DishCard;
