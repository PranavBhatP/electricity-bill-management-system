'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

type BillsChartProps = {
  paidBills: number;
  unpaidBills: number;
};

export default function BillsChart({ paidBills, unpaidBills }: BillsChartProps) {
  const data = {
    labels: ['Paid Bills', 'Unpaid Bills'],
    datasets: [
      {
        data: [paidBills, unpaidBills],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green-500
          'rgba(239, 68, 68, 0.8)', // red-500
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Bills Payment Statistics',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="h-[300px] flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Paid Bills</p>
          <p className="text-2xl font-bold text-green-500">{paidBills}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Unpaid Bills</p>
          <p className="text-2xl font-bold text-red-500">{unpaidBills}</p>
        </div>
      </div>
    </div>
  );
} 