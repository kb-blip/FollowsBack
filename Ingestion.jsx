import React, { useState } from 'react';
import { FileArchive, CheckCircle, FolderOpen } from 'lucide-react';
import { processZipUpload, processFolderUpload, compareSnapshots } from './processor';

export default function Ingestion({ onIngest }) {
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [diffResult, setDiffResult] = useState(null);

    // Helper to recursively read dropped folders
    const getDroppedFiles = async (items) => {
        const files = [];
        const queue = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) queue.push(item);
        }

        while (queue.length > 0) {
            const entry = queue.shift();
            if (entry.isFile) {
                const file = await new Promise(resolve => entry.file(resolve));
                files.push(file);
            } else if (entry.isDirectory) {
                const dirReader = entry.createReader();
                const entries = await new Promise(resolve => dirReader.readEntries(resolve));
                queue.push(...entries);
            }
        }
        return files;
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setProcessing(true);
        setDiffResult(null);

        try {
            const files = await getDroppedFiles(e.dataTransfer.items);
            if (files.length === 0) throw new Error("No files found.");

            let snapshot;
            const zipFile = files.find(f => f.name.endsWith('.zip'));

            // Route logic based on file type
            if (zipFile) {
                snapshot = await processZipUpload(zipFile);
            } else {
                snapshot = await processFolderUpload(files);
            }

            const previousSnapshot = onIngest(snapshot);

            if (previousSnapshot) {
                setDiffResult(compareSnapshots(previousSnapshot, snapshot));
            } else {
                setDiffResult({ firstUpload: true, total: snapshot.stats.totalFollowers });
            }
        } catch (error) {
            console.error("Ingestion failed", error);
            alert("Failed to parse data. Ensure you dropped a valid Instagram export folder or .zip.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-12">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-100">Data Ingestion</h2>
                <p className="text-zinc-500 mt-2">Drag and drop your <code className="text-rose-400">Instagram .zip</code> OR the unzipped <code className="text-rose-400">connections folder</code> here.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-zinc-800 bg-zinc-900/30'}
                    ${processing ? 'opacity-50 cursor-wait' : 'hover:border-zinc-700'}
                `}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        {processing ? (
                            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FolderOpen className="text-zinc-400" size={24} />
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-medium text-zinc-200">
                            {processing ? 'Extracting & Crunching numbers...' : 'Drop your Folder or .zip file'}
                        </p>
                    </div>
                </div>
            </div>

            {diffResult && (
                <div className="mt-8 p-6 bg-zinc-900/50 border border-violet-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="text-emerald-500" size={24} />
                        <h3 className="text-lg font-bold text-zinc-100">Sync Complete!</h3>
                    </div>

                    {diffResult.firstUpload ? (
                        <p className="text-zinc-400">First snapshot saved with <strong className="text-zinc-200">{diffResult.total}</strong> followers. Upload another snapshot later to see unfollowers.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                                <p className="text-sm text-zinc-500">Unfollowers</p>
                                <p className="text-2xl font-bold text-rose-500">{diffResult.lost.length}</p>
                            </div>
                            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                                <p className="text-sm text-zinc-500">New Followers</p>
                                <p className="text-2xl font-bold text-emerald-500">+{diffResult.gained.length}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}