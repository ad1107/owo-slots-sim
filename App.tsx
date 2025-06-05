
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart, registerables, ChartConfiguration } from 'chart.js/auto';
import { SlotSymbol, ReelsState, SpinStage } from './types';
import {
  MAX_BET,
  INITIAL_COWONCY,
  MIN_BET,
  REVEAL_DELAY_1,
  REVEAL_DELAY_2,
  REVEAL_DELAY_3,
  PAYOUT_RULES,
} from './constants';
import PayoutTable from './components/PayoutTable';

Chart.register(...registerables);

const BOT_SLOTS_ORDER: SlotSymbol[] = [
  SlotSymbol.EGGPLANT,
  SlotSymbol.HEART,
  SlotSymbol.CHERRY,
  SlotSymbol.COWONCY,
  SlotSymbol.O_SYM,
  SlotSymbol.W_SYM,
];

const MAX_QUICK_SIMULATIONS = 10000;


const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(INITIAL_COWONCY);
  const [betAmount, setBetAmount] = useState<string>("100");
  const [displayedReels, setDisplayedReels] = useState<ReelsState>([SlotSymbol.SPINNING, SlotSymbol.SPINNING, SlotSymbol.SPINNING]);
  const [actualReels, setActualReels] = useState<ReelsState | null>(null);
  const [spinStage, setSpinStage] = useState<SpinStage>(SpinStage.IDLE);
  const [message, setMessage] = useState<string>("Place your bet and spin!");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [balanceHistory, setBalanceHistory] = useState<{ spins: number[]; balance: number[] }>({ spins: [0], balance: [INITIAL_COWONCY] });

  const [addBalanceInput, setAddBalanceInput] = useState<string>("");
  const [setBalanceInput, setSetBalanceInput] = useState<string>("");

  const [numSimulationsInput, setNumSimulationsInput] = useState<string>("10");
  const [isQuickSimulating, setIsQuickSimulating] = useState<boolean>(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const formatCowoncy = (amount: number): string => {
    return amount.toLocaleString();
  };

  const determineOutcome = useCallback((currentBet: number): { finalReels: ReelsState; prize: number; winName: string | null } => {
    const rand = Math.random() * 100;
    let finalReels: ReelsState;
    let prize: number;
    let winName: string | null = null;

    if (rand <= 20) {
      finalReels = [SlotSymbol.EGGPLANT, SlotSymbol.EGGPLANT, SlotSymbol.EGGPLANT];
      prize = currentBet * 1;
      winName = PAYOUT_RULES.find(r => r.multiplier === 1)!.name;
    } else if (rand <= 40) {
      finalReels = [SlotSymbol.HEART, SlotSymbol.HEART, SlotSymbol.HEART];
      prize = currentBet * 2;
      winName = PAYOUT_RULES.find(r => r.multiplier === 2)!.name;
    } else if (rand <= 45) {
      finalReels = [SlotSymbol.CHERRY, SlotSymbol.CHERRY, SlotSymbol.CHERRY];
      prize = currentBet * 3;
      winName = PAYOUT_RULES.find(r => r.multiplier === 3)!.name;
    } else if (rand <= 47.5) {
      finalReels = [SlotSymbol.COWONCY, SlotSymbol.COWONCY, SlotSymbol.COWONCY];
      prize = currentBet * 4;
      winName = PAYOUT_RULES.find(r => r.multiplier === 4)!.name;
    } else if (rand <= 48.5) {
      finalReels = [SlotSymbol.O_SYM, SlotSymbol.W_SYM, SlotSymbol.O_SYM];
      prize = currentBet * 10;
      winName = PAYOUT_RULES.find(r => r.multiplier === 10)!.name;
    } else {
      let reel1Idx = Math.floor(Math.random() * (BOT_SLOTS_ORDER.length - 1));
      let reel2Idx = Math.floor(Math.random() * (BOT_SLOTS_ORDER.length - 1));
      let reel3Idx = Math.floor(Math.random() * (BOT_SLOTS_ORDER.length - 1));

      if (reel3Idx === reel1Idx) {
        reel2Idx = (reel1Idx + Math.ceil(Math.random() * (BOT_SLOTS_ORDER.length - 2))) % (BOT_SLOTS_ORDER.length - 1);
      }

      if (reel2Idx === (BOT_SLOTS_ORDER.length - 2)) {
        reel2Idx++;
      }

      finalReels = [
        BOT_SLOTS_ORDER[reel1Idx],
        BOT_SLOTS_ORDER[reel2Idx],
        BOT_SLOTS_ORDER[reel3Idx],
      ];
      prize = 0;
      winName = null;
    }
    return { finalReels, prize, winName };
  }, []);


  const handleSpin = useCallback(() => {
    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet < MIN_BET) {
      setMessage(`Invalid bet. Min: ${formatCowoncy(MIN_BET)}.`);
      return;
    }
    if (bet > MAX_BET) {
      setMessage(`Bet exceeds max: ${formatCowoncy(MAX_BET)}. Adjusted to max.`);
      setBetAmount(MAX_BET.toString()); 
      return; 
    }

    if (balance < bet) {
      setMessage("Not enough cowoncy to bet!");
      return;
    }

    setIsSpinning(true);
    setSpinStage(SpinStage.INITIAL_SPIN);

    const newBalanceAfterBet = balance - bet;
    setBalance(newBalanceAfterBet);

    setMessage("Spinning...");
    setDisplayedReels([SlotSymbol.SPINNING, SlotSymbol.SPINNING, SlotSymbol.SPINNING]);

    const outcome = determineOutcome(bet);
    setActualReels(outcome.finalReels);

    setBalanceHistory(prev => ({
      spins: [...prev.spins, prev.spins.length > 0 ? prev.spins[prev.spins.length -1] + 1 : 0],
      balance: [...prev.balance, newBalanceAfterBet]
    }));

    setTimeout(() => {
      setSpinStage(SpinStage.REVEAL_REEL_1);
      setDisplayedReels(prev => [outcome.finalReels[0], SlotSymbol.SPINNING, SlotSymbol.SPINNING]);
    }, REVEAL_DELAY_1);

    setTimeout(() => {
      setSpinStage(SpinStage.REVEAL_REEL_3);
      setDisplayedReels(prev => [outcome.finalReels[0], SlotSymbol.SPINNING, outcome.finalReels[2]]);
    }, REVEAL_DELAY_1 + REVEAL_DELAY_2);


    setTimeout(() => {
      setSpinStage(SpinStage.REVEAL_REEL_2);
      setDisplayedReels(outcome.finalReels);

      const finalBalance = newBalanceAfterBet + outcome.prize;
      setBalance(finalBalance);

      setBalanceHistory(prev => {
        const updatedBalances = [...prev.balance];
        updatedBalances[updatedBalances.length - 1] = finalBalance;
        return {
          spins: prev.spins,
          balance: updatedBalances
        };
      });

      if (outcome.prize > 0) {
        setMessage(`🎉 You won ${formatCowoncy(outcome.prize)} cowoncy! ${outcome.winName ? `(${outcome.winName})` : ''} 🎉`);
      } else {
        setMessage("Better luck next time! You won nothing. :c");
      }
      setIsSpinning(false);
      setSpinStage(SpinStage.IDLE);
    }, REVEAL_DELAY_1 + REVEAL_DELAY_2 + REVEAL_DELAY_3);

  }, [betAmount, balance, determineOutcome]);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      const numValue = parseInt(value);
      if (value === "") {
        setBetAmount("");
      } else if (numValue > MAX_BET) {
        setBetAmount(MAX_BET.toString());
        setMessage(`Max bet is ${formatCowoncy(MAX_BET)}.`);
      } else if (numValue < MIN_BET && value !== "" && numValue !== 0) { 
         setBetAmount(MIN_BET.toString());
         setMessage(`Min bet is ${formatCowoncy(MIN_BET)}.`);
      }
      else {
        setBetAmount(value);
         if(numValue >= MIN_BET && numValue <= MAX_BET) setMessage("Place your bet and spin!");
      }
    }
  };

  const setBet = (amount: number | 'all') => {
    if (amount === 'all') {
      const allInAmount = Math.max(MIN_BET, Math.min(balance, MAX_BET));
      setBetAmount(allInAmount > 0 ? allInAmount.toString() : MIN_BET.toString());
    } else {
      const validatedAmount = Math.max(MIN_BET, Math.min(amount, MAX_BET));
      setBetAmount(validatedAmount.toString());
    }
     setMessage("Place your bet and spin!");
  };

  const handleAddBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || value === "-" || /^-?[0-9]*$/.test(value)) {
      setAddBalanceInput(value);
    }
  };

  const handleSetBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]*$/.test(value)) {
      setSetBalanceInput(value);
    }
  };

  const handleAddBalance = () => {
    const amount = parseInt(addBalanceInput);
    if (isNaN(amount)) {
      setMessage("Invalid amount to add.");
      return;
    }
    const newBalance = Math.max(0, balance + amount);
    setBalance(newBalance);
    setBalanceHistory(prev => {
      const lastSpinNumber = prev.spins.length > 0 ? prev.spins[prev.spins.length - 1] : -1;
      return {
        spins: [...prev.spins, lastSpinNumber + 1],
        balance: [...prev.balance, newBalance]
      };
    });
    setMessage(`Balance adjusted by ${formatCowoncy(amount)}. New balance: ${formatCowoncy(newBalance)}.`);
    setAddBalanceInput("");
  };

  const handleSetBalance = () => {
    const amount = parseInt(setBalanceInput);
    if (isNaN(amount) || amount < 0) {
      setMessage("Invalid amount. Balance must be 0 or greater.");
      return;
    }
    setBalance(amount);
    setBalanceHistory(prev => {
      const lastSpinNumber = prev.spins.length > 0 ? prev.spins[prev.spins.length - 1] : -1;
      return {
        spins: [...prev.spins, lastSpinNumber + 1],
        balance: [...prev.balance, amount]
      };
    });
    setMessage(`Balance set to ${formatCowoncy(amount)}.`);
    setSetBalanceInput("");
  };

  const handleNumSimulationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
        const numValue = parseInt(value);
        if (value === "") {
            setNumSimulationsInput("");
        } else if (numValue > MAX_QUICK_SIMULATIONS) {
            setNumSimulationsInput(MAX_QUICK_SIMULATIONS.toString());
            setMessage(`Max simulations: ${formatCowoncy(MAX_QUICK_SIMULATIONS)}.`);
        } else if (numValue < 1 && value !== "") {
            setNumSimulationsInput("1");
        } else {
            setNumSimulationsInput(value);
        }
    }
  };

  const handleQuickSimulate = () => {
    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet < MIN_BET || bet > MAX_BET) {
      setMessage(`Invalid bet for simulation. Min: ${formatCowoncy(MIN_BET)}, Max: ${formatCowoncy(MAX_BET)}.`);
      return;
    }

    const numSims = parseInt(numSimulationsInput);
    if (isNaN(numSims) || numSims < 1 || numSims > MAX_QUICK_SIMULATIONS) {
      setMessage(`Invalid number of simulations. Must be 1-${formatCowoncy(MAX_QUICK_SIMULATIONS)}.`);
      return;
    }
    
    if (balance < bet) { 
        setMessage("Not enough cowoncy for the bet amount.");
        return;
    }

    const balanceAtStartOfSim = balance;
    setIsQuickSimulating(true);
    setMessage(`Simulating ${formatCowoncy(numSims)} spins...`);

    let currentSimBalance = balanceAtStartOfSim;
    const newSpinNumbers: number[] = [];
    const newBalanceValues: number[] = [];
    let lastSpinNumber = balanceHistory.spins.length > 0 ? balanceHistory.spins[balanceHistory.spins.length - 1] : -1;
    let totalNetChange = 0;
    let actualSimsRun = 0;

    for (let i = 0; i < numSims; i++) {
      if (currentSimBalance < bet) {
        // This message is temporary and will be replaced by the final summary
        // setMessage(`Simulation stopped after ${formatCowoncy(i)} spins due to insufficient balance.`);
        break; 
      }
      actualSimsRun++;
      currentSimBalance -= bet;
      
      const outcome = determineOutcome(bet);
      currentSimBalance += outcome.prize;
      totalNetChange += (outcome.prize - bet);

      lastSpinNumber++;
      newSpinNumbers.push(lastSpinNumber);
      newBalanceValues.push(currentSimBalance);
    }

    setBalance(currentSimBalance);
    if (actualSimsRun > 0) {
        setBalanceHistory(prev => ({
          spins: [...prev.spins, ...newSpinNumbers],
          balance: [...prev.balance, ...newBalanceValues],
        }));
    }
    
    let ratioDisplayString = "";
    if (balanceAtStartOfSim > 0) {
      const ratio = totalNetChange / balanceAtStartOfSim;
      ratioDisplayString = ` (${ratio >= 0 ? '+' : ''}${(ratio * 100).toFixed(2)}%)`;
    } else { 
      if (totalNetChange === 0) {
        ratioDisplayString = " (+0.00%)"; 
      } else {
        ratioDisplayString = " (N/A)"; 
      }
    }
    
    setMessage(
      `Quick simulation of ${formatCowoncy(actualSimsRun)} spins complete.\n` +
      `Net change: ${formatCowoncy(totalNetChange)}${ratioDisplayString}\n` +
      `Final Balance: ${formatCowoncy(currentSimBalance)}.`
    );
    setIsQuickSimulating(false);
  };


  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const config: ChartConfiguration = {
          type: 'line',
          data: {
            labels: balanceHistory.spins.map(String),
            datasets: [{
              label: 'Cowoncy Balance',
              data: balanceHistory.balance,
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.2,
              fill: true,
              pointRadius: balanceHistory.spins.length < 100 ? 3 : (balanceHistory.spins.length < 500 ? 1 : 0), 
              pointBackgroundColor: '#8B5CF6',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: balanceHistory.spins.length > 100 ? 0 : 800 
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: { color: '#4B5563', font: { size: 10 } },
                grid: { color: 'rgba(0,0,0,0.05)' }
              },
              x: {
                ticks: { color: '#4B5563', font: { size: 10 }, autoSkipPadding: 20, maxRotation: 0 },
                grid: { display: false },
                title: { display: true, text: 'Events (Spins / Adjustments)', color: '#4B5563' }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: { color: '#1F2937', font: { size: 12 } }
              },
              tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += formatCowoncy(context.parsed.y);
                    }
                    return label;
                  }
                }
              }
            }
          }
        };
        chartInstanceRef.current = new Chart(ctx, config);
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [balanceHistory]);


  const getReelSymbolClass = (symbol: SlotSymbol, isSpinningActual: boolean) => {
    if (isSpinningActual) return 'text-gray-400 blur-xs';

    switch (symbol) {
      case SlotSymbol.EGGPLANT: return 'text-purple-600';
      case SlotSymbol.HEART: return 'text-red-500';
      case SlotSymbol.CHERRY: return 'text-pink-600';
      case SlotSymbol.COWONCY: return 'text-yellow-500 animate-pulseLight';
      case SlotSymbol.O_SYM: return 'text-blue-500';
      case SlotSymbol.W_SYM: return 'text-green-500';
      default: return 'text-black';
    }
  };
  
  const isControlsDisabled = isSpinning || isQuickSimulating;
  const isSpinButtonDisabled = isControlsDisabled || balance < MIN_BET || parseInt(betAmount) < MIN_BET || balance < parseInt(betAmount) || betAmount === "" || parseInt(betAmount) === 0;


  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 text-center font-sans select-none bg-gradient-to-br from-pink-100 via-purple-100 to-orange-50 overflow-y-auto">
      <header className="my-6 md:my-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-orange-500 animate-pulseLight">
          owobot Slot Machine
        </h1>
        <p className="text-purple-700 mt-2 text-sm sm:text-base">Can you hit the jackpot? Good luck!</p>
      </header>

      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg mx-auto">
        <div className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-cowoncy-gold flex items-center justify-center">
          <span className="mr-2">{SlotSymbol.COWONCY}</span> Balance: {formatCowoncy(balance)}
        </div>

        <div className="flex justify-center items-center space-x-1 sm:space-x-2 md:space-x-3 text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 rounded-lg shadow-inner overflow-hidden">
          {([0, 1, 2] as const).map((index) => {
            const currentSymbol = displayedReels[index];
            let symbolToShow = currentSymbol;
            let isVisuallySpinning = false;

            if (spinStage === SpinStage.INITIAL_SPIN) {
              symbolToShow = SlotSymbol.SPINNING;
              isVisuallySpinning = true;
            } else if (spinStage === SpinStage.REVEAL_REEL_1 && index > 0) {
              symbolToShow = SlotSymbol.SPINNING;
              isVisuallySpinning = true;
            } else if (spinStage === SpinStage.REVEAL_REEL_3 && index === 1) {
              symbolToShow = SlotSymbol.SPINNING;
              isVisuallySpinning = true;
            }

            return (
              <div
                key={index}
                className={`w-1/3 h-20 sm:h-24 md:h-28 flex items-center justify-center rounded-md bg-white shadow-md transition-all duration-300 ease-in-out text-shadow-sm ${getReelSymbolClass(symbolToShow, isVisuallySpinning)} ${isVisuallySpinning ? 'animate-shake' : ''}`}
                aria-live={index === 0 ? "polite" : "off"}
                aria-label={`Reel ${index + 1} shows ${symbolToShow === SlotSymbol.SPINNING ? 'spinning' : symbolToShow}`}
              >
                {symbolToShow}
              </div>
            );
          })}
        </div>

        <div 
          id="message-area" 
          className="min-h-[4rem] sm:min-h-[5rem] md:min-h-[5.5rem] mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-purple-700 flex items-center justify-center px-2 whitespace-pre-line" 
          aria-live="assertive"
        >
          {message}
        </div>

        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <label htmlFor="betAmountInput" className="block text-xs sm:text-sm font-medium text-gray-700">Bet Amount (Min: {formatCowoncy(MIN_BET)}, Max: {formatCowoncy(MAX_BET)})</label>
          <input
            id="betAmountInput"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={betAmount}
            onChange={handleBetChange}
            disabled={isControlsDisabled}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out text-lg"
            aria-label="Bet amount"
          />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
            {[100, 500, 1000, 5000, 'all'].map((val) => (
              <button
                key={val}
                onClick={() => setBet(val as number | 'all')}
                disabled={isControlsDisabled}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {val === 'all' ? 'All In' : formatCowoncy(val as number)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinButtonDisabled}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 text-lg sm:text-xl font-bold text-white rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-102 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 focus:ring-pink-400'}
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:from-gray-400 disabled:hover:to-gray-400`}
          aria-label="Spin the reels"
        >
          {isSpinning ? 'Spinning...' : (isQuickSimulating ? 'Simulating...' : 'SPIN!')}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-3 items-start">
          <div>
            <label htmlFor="addBalanceInputControl" className="block text-xs font-medium text-gray-600 mb-0.5 text-left">Add/Subtract</label>
            <div className="flex items-center space-x-1">
              <input
                id="addBalanceInputControl"
                type="text"
                inputMode="numeric"
                value={addBalanceInput}
                onChange={handleAddBalanceInputChange}
                disabled={isControlsDisabled}
                className="w-20 p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                aria-label="Amount to add or subtract from balance"
                placeholder="Amount"
              />
              <button
                onClick={handleAddBalance}
                disabled={isControlsDisabled || addBalanceInput === "" || addBalanceInput === "-"}
                className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow hover:shadow-md transform hover:scale-105 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adjust
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="setBalanceInputControl" className="block text-xs font-medium text-gray-600 mb-0.5 text-left">Set Balance</label>
            <div className="flex items-center space-x-1">
              <input
                id="setBalanceInputControl"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={setBalanceInput}
                onChange={handleSetBalanceInputChange}
                disabled={isControlsDisabled}
                className="w-20 p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
                aria-label="Amount to set balance to"
                placeholder="Amount (>=0)"
              />
              <button
                onClick={handleSetBalance}
                disabled={isControlsDisabled || setBalanceInput === ""}
                className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow hover:shadow-md transform hover:scale-105 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-md sm:text-lg font-semibold text-purple-700 mb-2">Quick Simulate</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="numSimulationsInput" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Number of Spins (1 - {formatCowoncy(MAX_QUICK_SIMULATIONS)})</label>
              <input
                id="numSimulationsInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numSimulationsInput}
                onChange={handleNumSimulationsChange}
                disabled={isControlsDisabled}
                className="w-155 p-2 sm:p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out text-base"
                aria-label="Number of simulations"
              />
            </div
            <button
              onClick={handleQuickSimulate}
              disabled={isControlsDisabled || numSimulationsInput === "" || parseInt(numSimulationsInput) < 1 || parseInt(numSimulationsInput) > MAX_QUICK_SIMULATIONS || parseInt(betAmount) <= 0 || betAmount === "" || balance < parseInt(betAmount)}
              className="w-full py-2.5 sm:py-3 px-4 text-base sm:text-lg font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-102 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quick Simulate {numSimulationsInput !== "" && parseInt(numSimulationsInput) > 0 ? formatCowoncy(parseInt(numSimulationsInput)) : ''} Spins
            </button>
          </div>
        </div>

      </div>


      <div className="mt-6 sm:mt-8 w-full max-w-lg sm:max-w-xl md:max-w-2xl h-56 sm:h-64 md:h-72 bg-white/70 backdrop-blur-sm shadow-lg rounded-lg p-3 sm:p-4">
        <canvas ref={chartRef}></canvas>
      </div>

      <PayoutTable />

      <footer className="mt-8 sm:mt-12 mb-4 text-xs sm:text-sm text-gray-600">
        <p>For entertainment purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
