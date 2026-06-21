import React, { useState } from 'react';
import { Input, Tabs, Tag } from 'antd';
import { dishes } from '../data/dishes';
import { DishCategory, DISH_CATEGORY_LABELS } from '../types';
import DishCard from './DishCard';

const DishPalette: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<DishCategory>('meat');
  const categories: DishCategory[] = ['meat', 'veggie', 'soup'];

  const filtered = dishes.filter((d) => d.name.includes(search));

  const items = categories.map((cat) => ({
    key: cat,
    label: DISH_CATEGORY_LABELS[cat],
    children: (
      <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: 4 }}>
        {filtered
          .filter((d) => d.category === cat)
          .map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        {filtered.filter((d) => d.category === cat).length === 0 && (
          <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>无匹配菜品</div>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>
        菜品库
        <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
          {dishes.length}道
        </Tag>
      </h3>
      <Input.Search
        placeholder="搜索菜品名称"
        allowClear
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Tabs
        activeKey={activeCat}
        onChange={(key) => setActiveCat(key as DishCategory)}
        items={items}
        size="small"
      />
    </div>
  );
};

export default DishPalette;
