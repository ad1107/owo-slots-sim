
import React from 'react';
import { PAYOUT_RULES } from '../constants';

const PayoutTable: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-lg p-6 mt-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">Payouts</h2>
      <ul className="space-y-2">
        {PAYOUT_RULES.map((rule) => (
          <li key={rule.name} className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
            <span className="text-3xl">{rule.display}</span>
            <span className="text-purple-600 font-semibold">{rule.multiplier}x Bet</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PayoutTable;
