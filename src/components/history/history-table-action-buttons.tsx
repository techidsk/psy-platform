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

const DOWNLOAD_STATUS = {
    active: '下载中',
    pending: '等待中',
    completed: '已完成',
    failed: '失败',
};

export default function HistoryTableActionButtons({ datas, searchParams }: ButtonProps) {
    const selectedIds = useTableState((state) => state.selectedIds);
    const itemIds = selectedIds[USER_EXPERIMENTS_HISTORY] || [];

    const [loading, setLoading] = useState(false);
    const [downloadJobId, setDownloadJobId] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

    const resetDownloadState = () => {
        setDownloadJobId(null);
        setDownloadProgress(0);
        setDownloadStatus(null);
    };

    const [includeExperimentRecord, setIncludeExperimentRecord] = useState(true);
    const [includeInputRecord, setIncludeInputRecord] = useState(true);

    async function batchDownload() {
        if (!includeExperimentRecord && !includeInputRecord) {
            toast({
                title: '无法下载',
                description: '请至少选择一种记录',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }
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
                    const response = await fetch(
                        `/api/log/${id}?part=${data.part}&includeExperimentRecord=${includeExperimentRecord}&includeInputRecord=${includeInputRecord}`
                    );
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
        if (!includeExperimentRecord && !includeInputRecord) {
            toast({
                title: '无法下载',
                description: '请至少选择一种记录',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        const response = await fetch('/api/experiment/history', {
            method: 'POST',
            body: JSON.stringify({
                searchParams,
                includeExperimentRecord,
                includeInputRecord,
            }),
        });
        const data = await response.json();
        setDownloadJobId(data.jobId);
        setDownloadStatus('pending');
        // 保存为 zip 下载
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // link.setAttribute('download', `archive_${timestamp}.zip`);
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // window.URL.revokeObjectURL(url);
        // setLoading(false);
    }
    // TODO 添加下载路径

    const checkDownloadStatus = async () => {
        if (!downloadJobId) return;

        try {
            const response = await fetch(`/api/experiment/history?jobId=${downloadJobId}`);
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.status === 'completed') {
                    setDownloadStatus('completed');
                    // 触发下载
                    window.location.href = `/api/experiment/history?jobId=${downloadJobId}`;
                } else {
                    setDownloadStatus(data.status);
                    setDownloadProgress(data.progress);
                }
            } else if (contentType && contentType.includes('application/zip')) {
                // 直接处理文件下载
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'all_filtered_experiments.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setDownloadStatus('completed');
                setLoading(false);
                resetDownloadState();
            } else {
                console.error('Unexpected content type:', contentType);
                setDownloadStatus('error');
            }
        } catch (error) {
            console.error('Error checking download status:', error);
        }
    };

    const cancelDownload = async () => {
        if (!downloadJobId) return;

        try {
            await fetch(`/api/experiment/history?jobId=${downloadJobId}`, {
                method: 'DELETE',
            });
            setLoading(false);
            resetDownloadState();
        } catch (error) {
            console.error('Error cancelling download:', error);
        }
    };

    useEffect(() => {
        if (downloadJobId && downloadStatus !== 'completed') {
            const interval = setInterval(checkDownloadStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [downloadJobId, downloadStatus]);

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
            <div className="flex gap-2">
                <div className="form-control">
                    <label className="label cursor-pointer flex gap-1">
                        <span className="label-text">实验记录</span>
                        <input
                            type="checkbox"
                            checked={includeExperimentRecord}
                            onChange={(e) => setIncludeExperimentRecord(e.target.checked)}
                            className="checkbox"
                        />
                    </label>
                </div>
                <div className="form-control">
                    <label className="label cursor-pointer flex gap-1">
                        <span className="label-text">输入记录</span>
                        <input
                            type="checkbox"
                            checked={includeInputRecord}
                            onChange={(e) => setIncludeInputRecord(e.target.checked)}
                            className="checkbox"
                        />
                    </label>
                </div>
            </div>
            {downloadJobId && downloadStatus != 'completed' && (
                <div className="flex gap-2 items-center">
                    <p>
                        下载状态: {DOWNLOAD_STATUS[downloadStatus as keyof typeof DOWNLOAD_STATUS]}
                    </p>
                    <progress
                        className="progress w-56"
                        value={downloadProgress}
                        max="100"
                    ></progress>
                    <button className="btn btn-neutral btn-sm" onClick={cancelDownload}>
                        取消下载
                    </button>
                </div>
            )}
        </div>
    );
}
