import React from 'react';

interface DotsCounterProps {
  num: number;
  color: string;
}

/**
 * DotsCounter — 罗马数字式图形页码
 *
 * 用不同形状表示不同数量级：
 *  ● 小圆点 = 1       (w-1 h-1 rounded-full)
 *  ◆ 菱形   = 5       (rotate-45)
 *  ■ 大方块 = 10      (w-2 h-2)
 *  ▬ 长条   = 50      (w-3 h-1.5 rounded-sm)
 *
 * 例：6 → ◆●    7 → ◆●●    11 → ■●    55 → ▬◆    99 → ▬■■■■◆●●●●
 */
export const DotsCounter: React.FC<DotsCounterProps> = ({ num, color }) => {
  const groups: { count: number; cls: string }[] = [];
  let n = num;

  if (n >= 50) {
    groups.push({ count: 1, cls: 'w-3 h-1.5 rounded-sm' });
    n -= 50;
  }
  const tens = Math.floor(n / 10);
  if (tens > 0) {
    groups.push({ count: tens, cls: 'w-2 h-2' });
    n %= 10;
  }
  if (n >= 5) {
    groups.push({ count: 1, cls: 'w-[5px] h-[5px] rotate-45 rounded-sm' });
    n -= 5;
  }
  if (n > 0) {
    groups.push({ count: n, cls: 'w-1 h-1 rounded-full' });
  }

  let key = 0;
  return (
    <div className="flex gap-1.5 items-center">
      {groups.map((g) =>
        Array.from({ length: g.count }).map(() => (
          <div key={key++} className={g.cls} style={{ backgroundColor: color }} />
        ))
      )}
    </div>
  );
};
