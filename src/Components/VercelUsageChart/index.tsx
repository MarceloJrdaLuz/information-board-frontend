import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { IVercelUsageResponse } from "@/types/vercel/usage";

export function VercelUsageChart({ usage }: { usage: IVercelUsageResponse }) {

    if (!usage || !usage.daily) return null;

    const chartData = usage.daily.map(item => ({
        date: item.date.slice(5), // exibe somente "MM-DD"
        total: item.total
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 mt-8 w-full"
        >
            <h2 className="text-xl font-semibold mb-2 text-typography-800">
                Uso da Aplicação (Vercel)
            </h2>

            <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 px-4 py-2 rounded-xl shadow">
                    <span className="font-bold text-lg">
                        {usage.total_invocations.toLocaleString()}
                    </span>
                    <p className="text-sm">Invocações totais</p>
                </div>

                <div className="bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 px-4 py-2 rounded-xl shadow">
                    <span className="font-bold text-lg">
                        {usage.percent_used}%
                    </span>
                    <p className="text-sm">do plano Free</p>
                </div>
            </div>

            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorUse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                        <XAxis dataKey="date" tick={{ fill: "#888" }} />
                        <YAxis tick={{ fill: "#888" }} />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                borderRadius: "8px",
                                border: "none",
                                color: "#fff"
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#3b82f6"
                            fill="url(#colorUse)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
