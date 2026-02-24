import React from 'react';

/**
 * Coretime Logo SVG Component
 * A modern loop/cycle icon representing consistent routines and habits
 */
const CoretimeLogo = ({ className = '', size = 32 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="coretime-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="40" height="40" rx="10" fill="url(#coretime-grad)" />
        {/* Circular arrow / loop – representing a routine */}
        <path
            d="M20 10 C14.477 10 10 14.477 10 20 C10 25.523 14.477 30 20 30 C25.523 30 30 25.523 30 20 C30 17.5 29.1 15.2 27.6 13.4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
        />
        {/* Arrow head at the top of the loop */}
        <path
            d="M20 10 L17.5 13.5 M20 10 L23 13"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Checkmark in the center */}
        <path
            d="M16 20 L18.5 22.5 L24 17.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

export default CoretimeLogo;
