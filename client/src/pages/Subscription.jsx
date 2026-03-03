import React, { useState } from 'react';
import { Check, CreditCard, Sparkles, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'Starter',
        price: '0',
        period: '/month',
        description: 'Perfect for getting started with your reading journey.',
        features: [
            'Access to 5 books per month',
            'Basic reading statistics',
            'Community support',
            'ad-supported experience'
        ],
        highlight: false,
        icon: Zap,
        color: 'text-gray-400',
        buttonVariant: 'ghost'
    },
    {
        id: 'pro',
        name: 'Pro Reader',
        price: '9.99',
        period: '/month',
        description: 'Unlock your full potential with unlimited access.',
        features: [
            'Unlimited book access',
            'Advanced reading analytics',
            'Priority support',
            'Ad-free experience',
            'Offline reading',
            'Exclusive author content'
        ],
        highlight: true,
        icon: Sparkles,
        color: 'text-blue-400',
        buttonVariant: 'default'
    },
    {
        id: 'team',
        name: 'Team',
        price: '49.99',
        period: '/month',
        description: 'Best for book clubs and reading groups.',
        features: [
            'Everything in Pro for 5 members',
            'Shared reading lists',
            'Group discussions',
            'Admin dashboard',
            'Bulk book purchasing'
        ],
        highlight: false,
        icon: CreditCard,
        color: 'text-purple-400',
        buttonVariant: 'outline'
    }
];

export function Subscription() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <div className="p-8 space-y-12 min-h-screen pb-20">
            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Perfect Plan</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    Unlock a world of stories. Upgrade your reading experience with plans designed for every type of reader.
                </p>

                {/* Billing Toggle (Visual Only for now) */}
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
                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative p-8 flex flex-col h-full bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2",
                                plan.highlight && "bg-gradient-to-b from-blue-900/20 to-black/40 border-blue-500/30 ring-1 ring-blue-500/30"
                            )}
                        >
                            {plan.highlight && (
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
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
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
                                variant={plan.buttonVariant}
                                className="w-full"
                            >
                                {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default Subscription;
