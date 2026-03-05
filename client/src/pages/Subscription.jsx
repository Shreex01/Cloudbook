import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, CreditCard, Sparkles, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'Scholar',
        price: '0',
        period: '/month',
        description: 'Perfect for students getting started with their reading journey.',
        features: [
            'Access to max 10 books',
            'Night mode reading',
            'Basic reading statistics'
        ],
        highlight: false,
        icon: Zap,
        color: 'text-gray-400',
        buttonVariant: 'ghost'
    },
    {
        id: 'premium',
        name: 'Pro Reader',
        price: '149',
        period: '/month',
        description: 'Unlock your full potential with unlimited access.',
        features: [
            'Access to max 50 books',
            'Marketplace access (Buy/Publish)',
            'Reading stats with page continuation',
            'Advanced book navigation',
            'Reading Mode (Night Light)'
        ],
        highlight: true,
        icon: Sparkles,
        color: 'text-blue-400',
        buttonVariant: 'default'
    },
    {
        id: 'team',
        name: 'Reading Club',
        price: '399',
        period: '/month',
        description: 'Best for book clubs and reading groups.',
        features: [
            'All Pro Reader features',
            'Download book feature',
            'Priority support',
            'Shared community access'
        ],
        highlight: false,
        icon: CreditCard,
        color: 'text-purple-400',
        buttonVariant: 'outline'
    }
];



export function Subscription() {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const res = await axios.get(`/api/users/${userId}?_t=${Date.now()}`);
                    setUser(res.data);
                } catch (err) {
                    console.error("Failed to fetch user data", err);
                }
            }
        };
        fetchUser();

        window.addEventListener('userUpdated', fetchUser);
        return () => window.removeEventListener('userUpdated', fetchUser);
    }, []);

    const userTier = user?.subscriptionTier || 'free';

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (plan) => {
        if (plan.id === userTier) {
            alert(`You are already on the ${plan.name} plan!`);
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("Please log in to subscribe.");
            return;
        }

        setIsLoading(true);

        try {
            const resLoad = await loadRazorpayScript();
            if (!resLoad) {
                alert("Razorpay SDK failed to load. Are you online?");
                setIsLoading(false);
                return;
            }

            const res = await axios.post('/api/payment/create-order', {
                userId,
                isSubscription: true,
                tier: plan.id,
                amount: parseFloat(plan.price)
            });

            const { order } = res.data;

            const options = {
                key: "rzp_test_SMjIl6jiuay3fa",
                amount: order.amount,
                currency: order.currency,
                name: "CloudBook",
                description: `${plan.name} Subscription`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/api/payment/verify-payment', {
                            ...response,
                            userId,
                            isSubscription: true,
                            tier: plan.id
                        });
                        alert(verifyRes.data.message);
                        window.dispatchEvent(new Event('userUpdated')); // trigger app update
                        // Update local state without reload
                        setUser(prev => ({ ...prev, subscriptionTier: plan.id }));
                    } catch (verifyErr) {
                        console.error("Verification failed", verifyErr);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                theme: { color: "#2563EB" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert("Failed to initiate payment.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-12 min-h-screen pb-20">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Perfect Plan</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    Manage your plan. Upgrade your reading experience with plans designed for every type of reader.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-white" : "text-gray-500")}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-8 rounded-full bg-white/10 border border-white/10 p-1 relative transition-colors duration-300 focus:outline-none"
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full bg-blue-500 shadow-lg transition-all duration-300",
                            billingCycle === 'yearly' ? "translate-x-6" : "translate-x-0"
                        )} />
                    </button>
                    <span className={cn("text-sm font-medium transition-colors", billingCycle === 'yearly' ? "text-white" : "text-gray-500")}>
                        Yearly <span className="text-xs text-green-400 font-bold ml-1">-20%</span>
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isActive = plan.id === userTier;

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative p-8 flex flex-col h-full bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300",
                                !isActive && "hover:-translate-y-2",
                                plan.highlight && !isActive && "bg-gradient-to-b from-blue-900/20 to-black/40 border-blue-500/30 ring-1 ring-blue-500/30",
                                isActive && "bg-gradient-to-b from-indigo-900/40 to-black/60 border-indigo-400 ring-2 ring-indigo-400 shadow-2xl shadow-indigo-500/20"
                            )}
                        >
                            {isActive && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/10">
                                    YOUR ACTIVE PLAN
                                </div>
                            )}
                            {plan.highlight && !isActive && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white/5 border border-white/10", plan.color)}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                                <span className="text-gray-500">{plan.period}</span>
                            </div>

                            <div className="space-y-4 flex-1 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[18px]">
                                            <Check size={18} className="text-green-500" />
                                        </div>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={isActive ? "outline" : plan.buttonVariant}
                                className={cn(
                                    "w-full relative",
                                    isActive && "opacity-80 cursor-default hover:bg-transparent border-indigo-400/50 text-indigo-200"
                                )}
                                onClick={() => !isActive && handleSubscribe(plan)}
                                disabled={isLoading || isActive}
                            >
                                {isActive ? 'Current Plan' : 'Subscribe Now'}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default Subscription;
