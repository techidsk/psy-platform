import './styles.css';

export default function LoadingSpin({ displayNum = 1 }: { displayNum?: number }) {
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
