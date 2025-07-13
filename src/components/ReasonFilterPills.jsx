
import React from 'react';
import { motion } from 'framer-motion';
import { usePrismaticColor } from './ColorContext';

const ReasonPill = ({ label, isSelected, onClick }) => {
    const { currentColor } = usePrismaticColor();

    return (
        <motion.button
            onClick={onClick}
            className="capitalize text-gray-500 font-medium transition-all duration-300 font-inter"
            style={{ fontSize: '1.7rem' }} // Updated font size from 1.9rem to 1.7rem
            animate={{
                color: isSelected ? currentColor : '#6B7280', // Tailwind's gray-500
                fontWeight: isSelected ? '700' : '500',
                scale: isSelected ? 1.05 : 1,
            }}
            whileHover={{ 
                color: isSelected ? currentColor : '#111827', // Tailwind's gray-900
                scale: 1.05 
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
        >
            {label}
        </motion.button>
    );
};

export default function ReasonFilterPills({ reasons, selectedReason, onReasonChange }) {
    const handleReasonClick = (reason) => {
        // If "All" is clicked, clear the reason filter
        if (reason.toLowerCase() === 'all') {
            onReasonChange('');
        } else {
            // Otherwise, set the selected reason. Toggle off if already selected.
            onReasonChange(prev => prev.toLowerCase() === reason.toLowerCase() ? '' : reason);
        }
    };

    if (!reasons || reasons.length <= 1) {
        return null; // Don't render if there are no reasons to filter by (or only "All")
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center flex-wrap items-center gap-x-6 gap-y-3"
        >
            {reasons.map((reason) => (
                <ReasonPill
                    key={reason}
                    label={reason}
                    // Handle "All" selection case
                    isSelected={(reason.toLowerCase() === 'all' && selectedReason === '') || selectedReason.toLowerCase() === reason.toLowerCase()}
                    onClick={() => handleReasonClick(reason)}
                />
            ))}
        </motion.div>
    );
};
