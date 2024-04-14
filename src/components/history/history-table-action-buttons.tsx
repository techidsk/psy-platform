'use client';

import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { useTableState } from '@/state/_table_atom';

interface ButtonProps {
    datas: any[];
}
const USER_EXPERIMENTS_HISTORY = 'user_experiments_history';

export default function HistoryTableActionButtons({ datas }: ButtonProps) {
    const selectedIds = useTableState((state) => state.selectedIds);
    const itemIds = selectedIds[USER_EXPERIMENTS_HISTORY] || [];
    async function batchDownload() {
        if (itemIds.length === 0) {
            logger.warn('批量下载，未选中任何文件');
            toast({
                title: '下载失败',
                description: '请选择下载文件',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        const JSZip = require('jszip');
        const zip = new JSZip();
        for (const data of datas) {
            if (itemIds.includes(data.id)) {
                const id = data.nano_id;
                const filename = `[${data.experiment_name}]-${data.nano_id}`;
                try {
                    const response = await fetch(`/api/log/${id}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const blob = await response.blob();
                    zip.file(`${filename}.zip`, blob);
                } catch (error) {
                    console.error('Download failed:', error);
                }
            }
        }

        // 生成ZIP文件并触发下载
        zip.generateAsync({ type: 'blob' }).then(function (content: any) {
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'archive.zip');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    }

    return (
        <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => batchDownload()}>
                批量下载
            </button>
        </div>
    );
}
