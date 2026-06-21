import React from 'react';
import { Card, Statistic, Tag, Alert, Empty, Progress } from 'antd';
import {
  AllergenConflict,
  RepeatWarning,
  ALLERGEN_LABELS,
  MEAL_SLOT_LABELS,
  DAY_LABELS,
  DISH_CATEGORY_LABELS,
  MealSlot,
  WeekMenu,
  NutritionSummary,
  Dish,
} from '../types';

interface NutritionSummaryPanelProps {
  conflicts: AllergenConflict[];
  repeats: RepeatWarning[];
  weekMenu: WeekMenu;
  getNutritionSummary: (day: number, slot: MealSlot) => NutritionSummary;
}

const ENERGY_DAILY_TARGET = 2000;
const PROTEIN_DAILY_TARGET = 60;

const NutritionSummaryPanel: React.FC<NutritionSummaryPanelProps> = ({
  conflicts,
  repeats,
  weekMenu,
  getNutritionSummary,
}) => {
  let totalEnergy = 0;
  let totalProtein = 0;
  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
  const dailyData: { day: number; energy: number; protein: number }[] = [];

  for (let d = 0; d < 7; d++) {
    let dayEnergy = 0;
    let dayProtein = 0;
    for (const slot of slots) {
      const s = getNutritionSummary(d, slot);
      dayEnergy += s.energy;
      dayProtein += s.protein;
    }
    dailyData.push({ day: d, energy: dayEnergy, protein: dayProtein });
    totalEnergy += dayEnergy;
    totalProtein += dayProtein;
  }

  const dishCount = Object.values(weekMenu.days)
    .flatMap((day) => Object.values(day as Record<MealSlot, Dish[]>))
    .flat().length;

  const maxEnergy = Math.max(ENERGY_DAILY_TARGET, ...dailyData.map((d) => d.energy), 1);

  return (
    <div style={{ width: 340, flexShrink: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
      <Card title="营养汇总" size="small" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Statistic title="周总能量" value={totalEnergy} suffix="kcal" valueStyle={{ fontSize: 18 }} />
          <Statistic title="周总蛋白质" value={totalProtein} suffix="g" valueStyle={{ fontSize: 18 }} />
        </div>
        <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
          已配菜 {dishCount} 道 · 日均 {dishCount > 0 ? Math.round(totalEnergy / 7) : 0}kcal
        </div>
      </Card>

      <Card title="每日营养分布" size="small" style={{ marginBottom: 12 }}>
        {dailyData.every((d) => d.energy === 0) ? (
          <Empty description="暂无配餐数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div>
            {dailyData.map((d) => (
              <div key={d.day} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                  <span style={{ fontWeight: 500 }}>{DAY_LABELS[d.day]}</span>
                  <span style={{ color: '#888' }}>
                    {d.energy}kcal / {d.protein}g
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Progress
                      percent={Math.min(100, Math.round((d.energy / maxEnergy) * 100))}
                      showInfo={false}
                      strokeColor={d.energy > ENERGY_DAILY_TARGET ? '#ff4d4f' : '#1890ff'}
                      size="small"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#999' }}>
              <span>能量参考线: {ENERGY_DAILY_TARGET}kcal/日</span>
              <span>蛋白质参考: {PROTEIN_DAILY_TARGET}g/日</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="过敏原冲突" size="small" style={{ marginBottom: 12 }}>
        {conflicts.length === 0 ? (
          <Empty description="暂无冲突" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {conflicts.map((c, i) => (
              <div key={i} style={{ marginBottom: 4, fontSize: 12 }}>
                <Tag color="red" style={{ fontSize: 11 }}>
                  {c.className}
                </Tag>
                <span>
                  {DAY_LABELS[c.day]} {MEAL_SLOT_LABELS[c.slot]} {c.dishName}
                </span>
                <Tag color="orange" style={{ fontSize: 10, marginLeft: 4 }}>
                  {ALLERGEN_LABELS[c.allergen]}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="重复提醒" size="small">
        {repeats.length === 0 ? (
          <Empty description="暂无重复" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div>
            {repeats.map((r, i) => (
              <Alert
                key={i}
                type={r.type === 'exact' ? 'error' : 'warning'}
                showIcon
                message={
                  r.type === 'exact'
                    ? `${DISH_CATEGORY_LABELS[r.category]}连续同一道`
                    : `同类${r.tag}${DISH_CATEGORY_LABELS[r.category]}连续3天`
                }
                description={`${r.days.map((d) => DAY_LABELS[d]).join('、')}：${r.dishNames.join('、')}`}
                style={{ marginBottom: 8, fontSize: 12 }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NutritionSummaryPanel;
