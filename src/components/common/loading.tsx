import './styles.css';

export function LoadingSpin() {
    return (
        <div className="circle-loading-container">
            <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: '10px' }}>Loading...</div>
            <div className="circle" style={{ marginBottom: '65%' }}></div>
        </div>
    );
}
