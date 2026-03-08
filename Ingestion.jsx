import React, { useState, useRef } from 'react';
import { FileArchive, FolderOpen, CheckCircle, UploadCloud, AlertCircle } from 'lucide-react';
import { processZipUpload, processFolderUpload, compareSnapshots } from './processor';

export default function Ingestion({ onIngest }) {
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [diffResult, setDiffResult] = useState(null);
    const [error, setError] = useState(null);

    const zipInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // Handles the explicitly clicked inputs
    const handleFileInput = async (e, type) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setProcessing(true);
        setError(null);
        setDiffResult(null);

        try {
            let snapshot;
            if (type === 'zip') {
                snapshot = await processZipUpload(files[0]);
            } else {
                snapshot = await processFolderUpload(Array.from(files));
            }
            processSuccess(snapshot);
        } catch (err) {
            setError(err.message || "Failed to process the data.");
        } finally {
            setProcessing(false);
        }
    };

    // Handles Drag and Drop
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setProcessing(true);
        setError(null);
        setDiffResult(null);

        try {
            const files = await getDroppedFiles(e.dataTransfer.items);
            if (files.length === 0) throw new Error("No files found.");

            let snapshot;
            const zipFile = files.find(f => f.name.endsWith('.zip'));

            if (zipFile) {
                snapshot = await processZipUpload(zipFile);
            } else {
                snapshot = await processFolderUpload(files);
            }
            processSuccess(snapshot);
        } catch (err) {
            setError("Invalid format. Please drop a valid Instagram export.");
        } finally {
            setProcessing(false);
        }
    };

    const processSuccess = (snapshot) => {
        const previousSnapshot = onIngest(snapshot);
        if (previousSnapshot) {
            setDiffResult(compareSnapshots(previousSnapshot, snapshot));
        } else {
            setDiffResult({ firstUpload: true, total: snapshot.stats.totalFollowers });
        }
    };

    // Recursive directory reader for drag-and-drop
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

    return (
        <div className="max-w-3xl mx-auto pt-10">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-apple-text">Add Data</h2>
                <p className="text-apple-muted mt-2 text-sm">Upload your Instagram export to update your database.</p>
            </div>

            {/* Error Boundary / Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-apple border border-apple-border overflow-hidden">
                {/* Drag and Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        p-14 text-center transition-all duration-300 border-b border-apple-border
                        ${isDragging ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50/50'}
                        ${processing ? 'opacity-50 cursor-wait' : ''}
                    `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 text-apple-blue' : 'bg-gray-100 text-apple-muted'}`}>
                            {processing ? (
                                <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <UploadCloud size={28} />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-apple-text">
                                {processing ? 'Crunching numbers...' : 'Drag & Drop Data'}
                            </p>
                            <p className="text-sm text-apple-muted mt-1">Drop your .zip or extracted folder here</p>
                        </div>
                    </div>
                </div>

                {/* Explicit Action Buttons */}
                <div className="grid grid-cols-2 divide-x divide-apple-border bg-gray-50/30">
                    <button
                        onClick={() => zipInputRef.current?.click()}
                        disabled={processing}
                        className="flex flex-col items-center gap-2 p-6 hover:bg-white transition-colors cursor-pointer group"
                    >
                        <FileArchive className="text-apple-blue opacity-80 group-hover:opacity-100 transition-opacity" size={24} />
                        <span className="text-sm font-medium text-apple-text">Select .ZIP Archive</span>
                        <input type="file" accept=".zip" className="hidden" ref={zipInputRef} onChange={(e) => handleFileInput(e, 'zip')} />
                    </button>

                    <button
                        onClick={() => folderInputRef.current?.click()}
                        disabled={processing}
                        className="flex flex-col items-center gap-2 p-6 hover:bg-white transition-colors cursor-pointer group"
                    >
                        <FolderOpen className="text-apple-blue opacity-80 group-hover:opacity-100 transition-opacity" size={24} />
                        <span className="text-sm font-medium text-apple-text">Select Data Folder</span>
                        <input type="file" webkitdirectory="true" directory="true" className="hidden" ref={folderInputRef} onChange={(e) => handleFileInput(e, 'folder')} />
                    </button>
                </div>
            </div>

            {/* Success Results Card */}
            {diffResult && (
                <div className="mt-8 p-6 bg-white rounded-2xl shadow-apple border border-apple-border animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-apple-border">
                        <CheckCircle className="text-[#34C759]" size={24} />
                        <h3 className="text-lg font-semibold text-apple-text">Database Updated</h3>
                    </div>

                    {diffResult.firstUpload ? (
                        <p className="text-apple-muted text-sm leading-relaxed">
                            First snapshot securely saved. We logged <strong className="text-apple-text">{diffResult.total}</strong> total followers. Upload your next export in the future to track changes.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-apple-bg rounded-xl border border-apple-border/50">
                                <p className="text-xs font-medium text-apple-muted uppercase tracking-wider mb-1">Lost Followers</p>
                                <p className="text-2xl font-bold text-apple-rose">{diffResult.lost.length}</p>
                            </div>
                            <div className="p-4 bg-apple-bg rounded-xl border border-apple-border/50">
                                <p className="text-xs font-medium text-apple-muted uppercase tracking-wider mb-1">New Followers</p>
                                <p className="text-2xl font-bold text-[#34C759]">+{diffResult.gained.length}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}