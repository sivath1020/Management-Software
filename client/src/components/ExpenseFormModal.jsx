import React, { useState, useRef } from 'react';
import { apiRequest, compressImage, formatFileSize } from '../api';

export default function ExpenseFormModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError('File size exceeds 20MB limit');
        return;
      }

      setError('');
      setIsCompressing(true);

      try {
        // Compress image using HTML5 canvas
        const { compressedFile, originalSize, compressedSize, isCompressed } = await compressImage(file);
        setBillFile(compressedFile);

        if (isCompressed) {
          const savedPct = Math.round(((originalSize - compressedSize) / originalSize) * 100);
          setCompressionInfo({
            original: formatFileSize(originalSize),
            compressed: formatFileSize(compressedSize),
            savedPct
          });
        } else {
          setCompressionInfo({
            original: formatFileSize(originalSize),
            compressed: formatFileSize(compressedSize),
            savedPct: 0
          });
        }

        // Preview
        if (compressedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setBillPreview(reader.result);
          };
          reader.readAsDataURL(compressedFile);
        } else {
          setBillPreview(null);
        }
      } catch (err) {
        console.warn('Compression error, using original file', err);
        setBillFile(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeFile = () => {
    setBillFile(null);
    setBillPreview(null);
    setCompressionInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('amount', amount);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }
      if (billFile) {
        formData.append('billPhoto', billFile);
      }

      await apiRequest('/expenses', {
        method: 'POST',
        body: formData
      });

      setAmount('');
      setNotes('');
      removeFile();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Submit Bill
            </h2>
            <p className="text-[11px] text-slate-500">
              Enter bill amount and attach photo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-base p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Minimal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Amount Only */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-extrabold text-slate-500 text-xl pointer-events-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 text-2xl font-extrabold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 text-slate-900 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Bill Photo (Optional with Auto Compression) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Bill Photo
              </label>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                Optional
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {isCompressing ? (
              <div className="w-full border border-slate-200 rounded-xl py-6 px-4 text-center bg-slate-50">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-semibold text-slate-700">
                  Compressing photo to smaller size...
                </p>
              </div>
            ) : !billFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl py-5 px-4 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-slate-50"
              >
                <p className="text-xs font-bold text-slate-800">
                  + Tap to Snap Photo or Upload Bill
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Auto-compresses large photos to small lightweight size
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    {billPreview ? (
                      <img
                        src={billPreview}
                        alt="preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        FILE
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {billFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold">
                        Size: {formatFileSize(billFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-rose-600 text-xs font-semibold hover:underline cursor-pointer px-2 py-1"
                  >
                    Remove
                  </button>
                </div>

                {/* Compression confirmation badge */}
                {compressionInfo && compressionInfo.savedPct > 0 && (
                  <div className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-1 rounded-md font-semibold flex items-center justify-between">
                    <span>Compressed: {compressionInfo.original} → {compressionInfo.compressed}</span>
                    <span className="font-extrabold text-emerald-700">{compressionInfo.savedPct}% smaller</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reason / Remark (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Reason / Remark
              </label>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                Optional
              </span>
            </div>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Flowers for Sunday pooja, EB bill, etc."
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 text-slate-900 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || isCompressing}
              className="w-full py-3 px-5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Claim...' : 'Submit Bill to Admin'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
