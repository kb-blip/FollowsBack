import React, { useState } from 'react';
import { Upload, FileArchive, CheckCircle } from 'lucide-react';
import { processZipUpload, compareSnapshots } from './processor';

export default function Ingestion({ onIngest }) {
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [diffResult, setDiffResult] = useState(null);

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];

        if (!file.name.endsWith('.zip')) {
            alert("Please upload the .zip file exported from Instagram.");
            return;
        }

        setProcessing(true);
        setDiffResult(null);

        try {
            const snapshot = await processZipUpload(file);
            const previousSnapshot = onIngest(snapshot);

            if (previousSnapshot) {
                setDiffResult(compareSnapshots(previousSnapshot, snapshot));
            } else {
                setDiffResult({ firstUpload: true, total: snapshot.stats.totalFollowers });
            }
        } catch (error) {
            console.error("Ingestion failed", error);
            alert("Failed to parse ZIP. Ensure it is a valid Instagram export.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-12">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-100">Data Ingestion</h2>
                <p className="text-zinc-500 mt-2">Upload your <code className="text-rose-400">Instagram .zip export</code> here. All extraction and processing happens locally in your browser.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={`
                    border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-zinc-800 bg-zinc-900/30'}
                    ${processing ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-zinc-700'}
                `}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        {processing ? (
                            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FileArchive className="text-zinc-400" size={24} />
                        )}
                    </div>

                    <div>
                        <p className="text-lg font-medium text-zinc-200">
                            {processing ? 'Extracting & Crunching numbers...' : 'Drag & Drop your .zip file'}
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" className="absolute inset-0 cursor-pointer" />
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