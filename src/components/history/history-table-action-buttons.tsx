'use client';

import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { useTableState } from '@/state/_table_atom';
import { useEffect, useState } from 'react';

interface ButtonProps {
    datas: any[];
    searchParams: { [key: string]: string };
}
const USER_EXPERIMENTS_HISTORY = 'user_experiments_history';

export default function HistoryTableActionButtons({ datas, searchParams }: ButtonProps) {
    const selectedIds = useTableState((state) => state.selectedIds);
    const itemIds = selectedIds[USER_EXPERIMENTS_HISTORY] || [];

    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        const JSZip = require('jszip');
        const zip = new JSZip();
        for (const data of datas) {
            if (itemIds.includes(data.id)) {
                const id = data.nano_id;
                const userQualtrics = data.qualtrics;

                let filename = `[${data.experiment_name}]-${userQualtrics}-${id}`;
                if (data.part !== 0) {
                    filename = `[${data.experiment_name}]-${data.part}-${userQualtrics}-${id}`;
                }
                try {
                    const response = await fetch(`/api/log/${id}?part=${data.part}`);
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
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `files_${timestamp}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
        setLoading(false);
    }

    async function batchDownloadAllSearched() {
        setLoading(true);
        const response = await fetch('/api/experiment/history', {
            method: 'POST',
            body: JSON.stringify({
                searchParams,
            }),
        });
        // 保存为 zip 下载
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('download', `archive_${timestamp}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setLoading(false);
    }

    return (
        <div className="flex gap-2">
            <div className="tooltip" data-tip="下载当前页面已选择的实验记录">
                <button
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                    onClick={() => batchDownload()}
                >
                    批量下载已选择
                </button>
            </div>
            {Object.entries(searchParams).filter(([key]) => key !== 'page' && key !== 'pagesize')
                .length !== 0 && (
                <div className="tooltip" data-tip="下载全部已经筛选的实验记录">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => batchDownloadAllSearched()}
                        disabled={loading}
                    >
                        全量下载已筛选
                    </button>
                </div>
            )}
        </div>
    );
}
