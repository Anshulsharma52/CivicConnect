import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import Modal from '../common/Modal';

const ResolutionModal = ({ isOpen, onClose, onSubmit, submitting = false }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + images.length > 5) {
      alert('You can upload a maximum of 5 resolution photos.');
      return;
    }
    const newImages = [...images, ...selectedFiles];
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      alert('Please provide a resolution summary note.');
      return;
    }

    const formData = new FormData();
    formData.append('status', 'RESOLVED');
    formData.append('resolutionNote', resolutionNote);
    images.forEach((file) => {
      formData.append('resolutionImages', file);
    });

    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Complaint as Resolved">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Resolution Summary / Work Details *
          </label>
          <textarea
            rows="3"
            required
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe the action taken (e.g. 'Pothole filled with cold asphalt mix and compacted. Road surface leveled.')"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Proof of Resolution Photos (Up to 5)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
            <input
              type="file"
              id="resolution-file-input"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="resolution-file-input" className="cursor-pointer">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">Click to upload completion photos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP (Max 5MB each)</p>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 h-16 group">
                  <img src={preview} alt="Resolution preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Confirm Resolution'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResolutionModal;
