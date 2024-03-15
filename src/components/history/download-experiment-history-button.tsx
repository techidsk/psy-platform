'use client';
interface ButtonProps {
    data: any;
}

export default function DownloadExperimentHistoryButton({ data }: ButtonProps) {
    async function downloadCSV(id: string) {
        try {
            const response = await fetch(`/api/log/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            // 创建一个指向blob的URL
            const url = window.URL.createObjectURL(blob);
            // 创建a标签并模拟点击以下载文件
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${id}.csv`);
            document.body.appendChild(link); // 需要添加到文档中才能触发点击
            link.click();

            // 清理DOM和创建的URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }

    return (
        <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => downloadCSV(data?.nano_id)}>
                下载记录
            </button>
        </div>
    );
}
