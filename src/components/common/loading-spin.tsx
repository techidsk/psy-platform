import './styles.css';

type LoadingVariant = 'circle' | 'line-scale';

interface LoadingSpinProps {
    variant?: LoadingVariant;
    displayNum?: number;
}

export default function LoadingSpin({ variant = 'line-scale', displayNum = 1 }: LoadingSpinProps) {
    if (variant === 'circle') {
        return (
            <div className="circle-loading-container">
                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: '10px' }}>
                    Loading...
                </div>
                <div className="circle" style={{ marginBottom: '65%' }}></div>
            </div>
        );
    }

    return (
        <div
            className={`line-scale max-w-[512px] flex justify-center ${
                displayNum === 1 ? 'min-w-[512px]' : 'min-w-[256px]'
            }`}
        >
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
        </div>
    );
}

// 向后兼容的命名导出
export { LoadingSpin };
