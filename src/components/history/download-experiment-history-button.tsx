'use client';

import { toast } from '@/hooks/use-toast';

interface ButtonProps {
    data: any;
}

export default function DownloadExperimentHistoryButton({ data }: ButtonProps) {
    async function downloadCSV(data: any) {
        const id = data.nano_id;

        const userQualtrics = data.qualtrics;
        let filename = `[${data.experiment_name}]-${userQualtrics}`;
        if (data.part !== 0) {
            filename = `[${data.experiment_name}]-${data.part}-${userQualtrics}`;
        }

        try {
            const response = await fetch(`/api/log/${id}?part=${data.part}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            // 创建一个指向blob的URL
            const url = window.URL.createObjectURL(blob);
            // 创建a标签并模拟点击以下载文件
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.zip`);
            document.body.appendChild(link); // 需要添加到文档中才能触发点击
            link.click();

            // 清理DOM和创建的URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast({
                title: '下载失败',
                description: `无法下载实验记录，请检查您的网络连接或稍后重试。错误详情: ${errorMessage}`,
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    return (
        <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => downloadCSV(data)}>
                下载记录
            </button>
        </div>
    );
}
