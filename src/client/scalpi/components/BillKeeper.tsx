import { useState } from 'react'; // заменишь на NumberInput, если используешь другой компонент
import { NumberInput } from '@heroui/react';

interface BillKeeper {
  1: number;
  2: number;
  5: number;
  10: number;
  20: number;
  50: number;
  100: number;
  200: number;
  500: number;
  1000: number;
}

interface BillKeeperProps {
  onUpdate: (total: number) => void;
}

const BillKeeper = ({ onUpdate }: BillKeeperProps) => {
  const [billkeeper, setBillKeeper] = useState<BillKeeper>({
    1: 0,
    2: 0,
    5: 0,
    10: 0,
    20: 0,
    50: 0,
    100: 0,
    200: 0,
    500: 0,
    1000: 0,
  });

  const handleChange = (key: keyof BillKeeper, value: number) => {
    setBillKeeper((prev) => {
      const next = { ...prev, [key]: value };
      const total = Object.entries(next).reduce(
        (sum, [k, v]) => sum + Number(k) * v,
        0
      );
      onUpdate(total);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 items-center justify-center">
      {Object.entries(billkeeper).map(([denomination, count]) => (
        <NumberInput
          key={denomination}
          type="number"
          aria-label={`${denomination} грн`}
          size="sm"
          value={count}
          className=""
          startContent={
            <div className="pointer-events-none text-sm text-nowrap bg-default-400 p-2 rounded-lg">
              {denomination} ₴
            </div>
          }
          onChange={(e) =>
            handleChange(
              denomination as unknown as keyof BillKeeper,
              Number(e) || 0
            )
          }
          minValue={0}
        />
      ))}
    </div>
  );
};

export default BillKeeper;
