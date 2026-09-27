import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  MapPin,
  Send,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import ComplaintMapPicker from '../../components/maps/ComplaintMapPicker';
import { CATEGORIES, PRIORITIES } from '../../utils/constants';
import { toast } from 'react-toastify';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Road Damage',
    priority: 'MEDIUM',
    address: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = ({ latitude, longitude, suggestedAddress }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      address: suggestedAddress || prev.address,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (images.length + selectedFiles.length > 5) {
      toast.warning('You can attach a maximum of 5 images.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter an issue title.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a detailed description of the issue.');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please provide the street address or location name.');
      return;
    }

    try {
      setSubmitting(true);

      const submission = new FormData();
      submission.append('title', formData.title.trim());
      submission.append('description', formData.description.trim());
      submission.append('category', formData.category);
      submission.append('priority', formData.priority);
      submission.append(
        'location',
        JSON.stringify({
          address: formData.address.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
      );

      images.forEach((file) => {
        submission.append('images', file);
      });

      const res = await complaintService.createComplaint(submission);

      if (res.success) {
        toast.success(`Complaint ${res.complaint.complaintId} created successfully!`);
        navigate(`/complaints/${res.complaint._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Citizen Grievance Submission
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Report a Civic Problem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit local infrastructure defects directly to the municipal council. Our department engineers will inspect and resolve it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Hazardous pothole opposite Community Center"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows="4"
              placeholder="Describe the severity, duration, or any public hazard caused by the defect..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Location Address & Map Picker */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Incident Location
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address / Landmark *
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. 5th Cross Road, Indira Nagar, Ward 84"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <ComplaintMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Defect Photos (Max 5)</h3>
              <span className="text-xs text-slate-400">{images.length}/5 photos attached</span>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                id="complaint-images"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="complaint-images" className="cursor-pointer">
                <UploadCloud className="w-9 h-9 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Click or drag photos here to attach
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP (Max 5MB each)</p>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 h-20 group">
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
