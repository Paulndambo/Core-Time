import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Utility to lock body scroll when modal is open
 */
const lockBodyScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
};

/**
 * Utility to unlock body scroll when modal is closed
 */
const unlockBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

/**
 * Reusable Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when modal should close
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} showCloseButton - Whether to show the close button
 * @param {function} onBackdropClick - Function to call when backdrop is clicked (defaults to onClose)
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    onBackdropClick,
    className = ''
}) => {
    // Lock body scroll when modal opens
    useEffect(() => {
        if (isOpen) {
            lockBodyScroll();
        } else {
            unlockBodyScroll();
        }

        // Cleanup: unlock scroll when component unmounts
        return () => {
            unlockBodyScroll();
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        '2xl': 'max-w-3xl',
        full: 'max-w-full mx-4'
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            if (onBackdropClick) {
                onBackdropClick();
            } else {
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <>
            {/* Backdrop - Separate layer to ensure full coverage */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                style={{ zIndex: 9998 }}
                onClick={handleBackdropClick}
                aria-hidden="true"
            ></div>
            
            {/* Modal Container */}
            <div
                className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                style={{ zIndex: 9999 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
            >
                {/* Modal Content */}
                <div
                className={`
                    relative z-10
                    bg-[var(--color-bg-secondary)] 
                    rounded-xl 
                    shadow-2xl 
                    w-full 
                    ${sizeClasses[size]}
                    max-h-[90vh]
                    overflow-hidden
                    flex flex-col
                    border border-[var(--color-border)]
                    transform transition-all
                    pointer-events-auto
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] flex-shrink-0">
                        <h3 
                            id="modal-title"
                            className="text-xl font-bold text-[var(--color-text-primary)]"
                        >
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full text-[var(--color-text-secondary)] transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                </div>
            </div>
        </>
    );

    // Use portal to render at document body level
    return createPortal(modalContent, document.body);
};

export default Modal;
