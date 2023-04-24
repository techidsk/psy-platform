import './styles.css';

export default function LoadingSpin() {
    return <div className="line-scale min-w-[256px] max-w-[512px] flex justify-center">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
    </div>
}