import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    Landmark, 
    X, 
    Loader2 as Loader, 
    ShoppingCart, 
    PlusCircle,
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
    FileText,
    PiggyBank,
    Banknote,
    Receipt
} from 'lucide-react';
import { useAuthStore } from '../authStore';
import { API_BASE_URL} from '../api/apiConfig';
// --- MODAL COMPONENTS ---

const WithdrawFundsModal = ({ onClose, onWithdraw, currentBalance }) => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) { setError('Please enter a valid positive amount.'); return; }
        if (numericAmount > currentBalance) { setError('Withdrawal amount cannot exceed your current balance.'); return; }
        setIsSubmitting(true);
        setError(null);
        try {
            await onWithdraw(numericAmount);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Withdraw Funds</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (INR)</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div>
                            <input type="number" name="amount" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-7 pr-12 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" placeholder="e.g., 5000" max={currentBalance} min="1" required />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-emrald-800 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-900 disabled:bg-gray-400 transition-colors">
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <Landmark size={20} />}
                        <span>{isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

const LogTransactionModal = ({ mode, onClose, onLog }) => {
    const isExpense = mode === 'expense';
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Seeds');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const expenseCategories = ['Seeds', 'Fertilizer', 'Pesticides', 'Labor', 'Machinery', 'Utilities', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) { setError('Please enter a valid positive amount.'); return; }
        if (!description.trim()) { setError(`Please enter a description for the ${mode}.`); return; }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const logData = { description, amount: numericAmount, date };
            if (isExpense) {
                logData.category = category;
            }
            onLog(logData);
            onClose();
        } catch (err) {
            setError(`Failed to log ${mode}. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const title = isExpense ? "Log External Expense" : "Log External Income";
    const buttonColor = isExpense ? "bg-rose-500 hover:bg-rose-600" : "bg-green-500 hover:bg-green-600";
    const ringColor = isExpense ? "focus:ring-rose-500 focus:border-rose-500" : "focus:ring-green-500 focus:border-green-500";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={`mt-1 w-full p-2 border border-gray-300 rounded-md ${ringColor}`} placeholder={isExpense ? "e.g., Purchase of wheat seeds" : "e.g., Sold produce at local market"} required />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (INR)</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div>
                            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full pl-7 p-2 border border-gray-300 rounded-md ${ringColor}`} placeholder="e.g., 2500" min="1" required />
                        </div>
                    </div>
                    {isExpense && (
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={`mt-1 w-full p-2 border border-gray-300 rounded-md ${ringColor}`}>
                               {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    )}
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 w-full p-2 border border-gray-300 rounded-md ${ringColor}`} required />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <button type="submit" disabled={isSubmitting} className={`w-full text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 disabled:bg-gray-400 transition-colors ${buttonColor}`}>
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : (isExpense ? <ShoppingCart size={20} /> : <PlusCircle size={20} />)}
                        <span>{isSubmitting ? 'Saving...' : `Log ${isExpense ? 'Expense' : 'Income'}`}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- UI Sub-components ---

const WalletSummary = ({ balance, isLoading, onOpenModal }) => (
    <div className="bg-green-700 text-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <p className="text-sm text-gray-300 flex items-center"><Wallet size={16} className="mr-2"/>Available Balance</p>
                <div className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
                    {isLoading ? <Loader size={40} className="animate-spin text-white" /> : `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button onClick={() => onOpenModal('income')} className="bg-white/10 hover:bg-white/20 font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"><PlusCircle size={18}/><span>Income</span></button>
                <button onClick={() => onOpenModal('expense')} className="bg-white/10 hover:bg-white/20 font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"><ShoppingCart size={18}/><span>Expense</span></button>
                <button onClick={() => onOpenModal('withdraw')} className="bg-white/90 text-gray-900 hover:bg-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"><Landmark size={18}/><span>Withdraw</span></button>
            </div>
        </div>
    </div>
);

const AnalysisPanel = ({ transactions }) => {
    const { totalIncome, totalExpenses, expenseCategories, netSavings } = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryMap = {};
        
        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (['release', 'deposit', 'external_income'].includes(tx.type)) {
                totalIncome += amount;
            } else if (['withdrawal', 'external_expense'].includes(tx.type)) {
                totalExpenses += amount;
                if (tx.type === 'external_expense') {
                    const category = tx.category || 'Other';
                    categoryMap[category] = (categoryMap[category] || 0) + amount;
                }
            }
        });
        
        const expenseCategoriesArray = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
        return { totalIncome, totalExpenses, expenseCategories: expenseCategoriesArray, netSavings: totalIncome - totalExpenses };
    }, [transactions]);

    const COLORS = ['#22c55e', '#f43f5e', '#f59e0b', '#38bdf8', '#8b5cf6'];
    
    if (transactions.length === 0 && expenseCategories.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center h-full flex flex-col justify-center items-center">
                <Receipt size={48} className="text-gray-300 mb-4"/>
                <h3 className="text-lg font-semibold text-gray-700">Awaiting Data</h3>
                <p className="text-gray-500 text-sm">No transactions in this period to analyze.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Period Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3"><Banknote className="text-green-600"/> <p className="text-sm text-green-700 font-semibold">Income</p></div>
                        <p className="text-lg font-bold text-green-800">₹{totalIncome.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                        <div className="flex items-center space-x-3"><ShoppingCart className="text-rose-600"/> <p className="text-sm text-rose-700 font-semibold">Expenses</p></div>
                        <p className="text-lg font-bold text-rose-800">₹{totalExpenses.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg ${netSavings >= 0 ? 'bg-slate-50' : 'bg-red-50'}`}>
                        <div className="flex items-center space-x-3"><PiggyBank className={`${netSavings >= 0 ? 'text-slate-600' : 'text-red-600'}`}/> <p className={`text-sm font-semibold ${netSavings >= 0 ? 'text-slate-700' : 'text-red-700'}`}>Net Savings</p></div>
                        <p className={`text-lg font-bold ${netSavings >= 0 ? 'text-slate-800' : 'text-red-800'}`}>₹{netSavings.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {expenseCategories.length > 0 ? (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Expense Breakdown</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={expenseCategories} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={85} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Expense Breakdown</h3>
                    <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No external expenses logged for this period.</div>
                </div>
            )}
        </div>
    );
};

const TransactionList = ({ transactions, isLoading, error }) => {
    const getTransactionIcon = (type) => {
        const iconProps = { size: 20, className: "text-white" };
        switch (type) {
            case 'release':
            case 'deposit':
            case 'external_income':
                return <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"><TrendingUp {...iconProps} /></div>;
            case 'withdrawal':
            case 'external_expense':
                return <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center"><TrendingDown {...iconProps} /></div>;
            case 'escrow':
                return <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center"><FileText {...iconProps} /></div>;
            default:
                return <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center"><ArrowRightLeft {...iconProps} /></div>;
        }
    };
    
    const getTransactionDescription = (tx) => {
        switch (tx.type) {
            case 'release': return `Payment from Contract #${tx.contract_id}`;
            case 'withdrawal': return 'Withdrawal to Bank';
            case 'deposit': return 'Funds Added to Wallet';
            case 'escrow': return `Funds Reserved for Contract #${tx.contract_id}`;
            case 'external_expense': return tx.description || 'External Expense';
            case 'external_income': return tx.description || 'External Income';
            default: return 'Transaction';
        }
    };

    const getFormattedAmount = (tx) => {
        const amount = parseFloat(tx.amount).toLocaleString('en-IN');
        if (['release', 'deposit', 'external_income'].includes(tx.type)) {
            return { text: `+ ₹${amount}`, class: 'text-green-600' };
        }
        if (['withdrawal', 'escrow', 'external_expense'].includes(tx.type)) {
            return { text: `- ₹${amount}`, class: 'text-rose-600' };
        }
        return { text: `₹${amount}`, class: 'text-gray-800' };
    };

    if (isLoading) return <div className="text-center p-12 bg-white rounded-lg border border-gray-200"><Loader className="animate-spin inline-block text-green-500" size={32}/></div>;
    if (error) return <div className="text-center p-12 bg-white rounded-lg border border-red-200 text-red-600 font-semibold">{error}</div>;
    if (transactions.length === 0) return <div className="text-center p-12 bg-white rounded-lg border border-gray-200 text-gray-500">No transactions for this period.</div>;

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            <ul className="divide-y divide-gray-100">
                {transactions.map(tx => {
                    const formattedAmount = getFormattedAmount(tx);
                    return (
                        <li key={tx.id} className="p-4 flex items-center space-x-4 hover:bg-green-50/50 transition-colors">
                            <div>{getTransactionIcon(tx.type)}</div>
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{getTransactionDescription(tx)}</p>
                                <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className={`text-lg font-bold text-right ${formattedAmount.class}`}>{formattedAmount.text}</div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

// --- MAIN FINANCE PAGE COMPONENT ---

const FinancePage = () => {
    const [balance, setBalance] = useState(0);
    const [apiTransactions, setApiTransactions] = useState([]);
    const [localTransactions, setLocalTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState(null); // 'withdraw', 'expense', 'income' or null
    const [selectedMonth, setSelectedMonth] = useState('All Time');
    const token = useAuthStore((state) => state.token);

    const fetchPaymentData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!token) {
            setError("Authentication required.");
            setIsLoading(false);
            return;
        }
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [walletRes, transRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/wallet/me`, { headers }),
                fetch(`${API_BASE_URL}/api/wallet/me/transactions`, { headers })
            ]);
            if (!walletRes.ok || !transRes.ok) throw new Error("Failed to load payment data. Please try again later.");
            const walletData = await walletRes.json();
            const transData = await transRes.json();
            setBalance(parseFloat(walletData.balance));
            setApiTransactions(transData); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchPaymentData(); }, [fetchPaymentData]);

    const allTransactions = useMemo(() => {
        return [...localTransactions, ...apiTransactions]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [localTransactions, apiTransactions]);

    const monthOptions = useMemo(() => {
        const months = new Set(allTransactions.map(tx => {
            const date = new Date(tx.created_at);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }));
        
        const sortedMonths = Array.from(months).sort().reverse().map(monthStr => {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, month - 1);
            return {
                value: date.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
                key: monthStr
            };
        });

        return [{ value: 'All Time', key: 'all' }, ...sortedMonths];
    }, [allTransactions]);

    const filteredTransactions = useMemo(() => {
        if (selectedMonth === 'All Time') return allTransactions;
        return allTransactions.filter(tx => new Date(tx.created_at).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) === selectedMonth);
    }, [allTransactions, selectedMonth]);

    const addLocalTransaction = (txData) => {
        setLocalTransactions(prev => [txData, ...prev]);
    };
    
    const handleWithdrawFunds = async (amount) => {
        if (!token) throw new Error("Authentication expired.");
        console.log(`Withdrawing ${amount}...`);
        alert("Withdrawal request submitted successfully! (Frontend Demo)");
        setBalance(prev => prev - amount);
        addLocalTransaction({
            id: `wd-${Date.now()}`,
            created_at: new Date().toISOString(),
            amount,
            type: 'withdrawal',
        });
    };

    const handleLogExpense = (expenseData) => {
        addLocalTransaction({
            id: `ext-${Date.now()}`,
            created_at: new Date(expenseData.date).toISOString(),
            amount: expenseData.amount,
            type: 'external_expense',
            description: expenseData.description,
            category: expenseData.category,
        });
    };
    
    const handleLogIncome = (incomeData) => {
        addLocalTransaction({
            id: `inc-${Date.now()}`,
            created_at: new Date(incomeData.date).toISOString(),
            amount: incomeData.amount,
            type: 'external_income',
            description: incomeData.description,
        });
    };

    return (
        <>
            {modal === 'withdraw' && <WithdrawFundsModal onClose={() => setModal(null)} onWithdraw={handleWithdrawFunds} currentBalance={balance} />}
            {modal === 'expense' && <LogTransactionModal mode="expense" onClose={() => setModal(null)} onLog={handleLogExpense} />}
            {modal === 'income' && <LogTransactionModal mode="income" onClose={() => setModal(null)} onLog={handleLogIncome} />}

            <div className="bg-green-50 min-h-screen">
                <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                    <header>
                        <h1 className="text-4xl font-bold text-green-800 tracking-tight">Financial Overview</h1>
                        <p className="text-gray-600 mt-2">Your central hub for tracking income, expenses, and savings.</p>
                    </header>
                    
                    <WalletSummary 
                        balance={balance} 
                        isLoading={isLoading}
                        onOpenModal={setModal}
                    />

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-6 border-t border-green-200/80">
                        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                        <div>
                            <select id="month-filter" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
                               {monthOptions.map(month => (
                                   <option key={month.key} value={month.value}>{month.value}</option>
                               ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        <div className="lg:col-span-3">
                            <TransactionList 
                                transactions={filteredTransactions} 
                                isLoading={isLoading} 
                                error={error} 
                            />
                        </div>
                        <div className="lg:col-span-2">
                             <AnalysisPanel transactions={filteredTransactions} />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default FinancePage;