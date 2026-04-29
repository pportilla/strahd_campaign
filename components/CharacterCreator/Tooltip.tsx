import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('top');
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            // Check if tooltip would go above the viewport
            if (triggerRect.top - tooltipRect.height < 10) {
                setPosition('bottom');
            } else {
                setPosition('top');
            }
        }
    }, [isVisible]);

    return (
        <div
            className={`relative inline-block ${className}`}
            ref={triggerRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && content && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 px-3 py-2 text-sm bg-stone-900 border border-stone-600/50 rounded-lg shadow-xl max-w-xs text-left
                        ${position === 'top'
                            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                            : 'top-full left-1/2 -translate-x-1/2 mt-2'
                        }
                        animate-fade-in
                    `}
                    style={{ minWidth: '200px' }}
                >
                    {/* Arrow */}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent
                            ${position === 'top'
                                ? 'top-full border-t-8 border-t-stone-600/50'
                                : 'bottom-full border-b-8 border-b-stone-600/50'
                            }
                        `}
                    />
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
