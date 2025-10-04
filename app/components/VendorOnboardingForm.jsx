"use client";

import React, { useState } from 'react';
import { FaSpinner, FaEye, FaEyeSlash, FaPlus, FaTrash, FaUpload, FaBuilding, FaUser, FaMapMarkerAlt, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const serviceCategories = [
  { value: 'private_jets', label: 'Private Jets', description: 'Charter private aircraft' },
  { value: 'luxury_cars', label: 'Luxury Cars', description: 'Premium vehicle rentals' },
  { value: 'super_cars', label: 'Super Cars', description: 'High-performance vehicles' },
  { value: 'helicopters', label: 'Helicopters', description: 'Helicopter charter services' },
  { value: 'yachts', label: 'Yachts', description: 'Luxury yacht rentals' },
  { value: 'charter_flights', label: 'Charter Flights', description: 'Commercial charter flights' }
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (3-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' }
];

const businessTypes = [
  { value: 'individual', label: 'Individual/Freelancer' },
  { value: 'company', label: 'Company/Corporation' },
  { value: 'agency', label: 'Agency/Broker' }
];

export default function VendorOnboardingForm({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    taxId: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    
    // Service Categories
    serviceCategories: [{
      category: '',
      description: '',
      experience: '',
      yearsOfExperience: '',
      certifications: []
    }],
    
    // Settings
    receiveUpdates: true,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
        
      case 2: // Business Information
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        break;
        
      case 3: // Address Information
        if (!formData.address.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.address.city.trim()) newErrors.city = 'City is required';
        if (!formData.address.state.trim()) newErrors.state = 'State is required';
        if (!formData.address.country.trim()) newErrors.country = 'Country is required';
        if (!formData.address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        break;
        
      case 4: // Service Categories
        if (formData.serviceCategories.length === 0) {
          newErrors.serviceCategories = 'At least one service category is required';
        } else {
          formData.serviceCategories.forEach((category, index) => {
            if (!category.category) newErrors[`category_${index}`] = 'Category is required';
            if (!category.description.trim()) newErrors[`description_${index}`] = 'Description is required';
            if (!category.experience) newErrors[`experience_${index}`] = 'Experience level is required';
            if (!category.yearsOfExperience) newErrors[`years_${index}`] = 'Years of experience is required';
          });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addServiceCategory = () => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: [...prev.serviceCategories, {
        category: '',
        description: '',
        experience: '',
        yearsOfExperience: '',
        certifications: []
      }]
    }));
  };

  const removeServiceCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.filter((_, i) => i !== index)
    }));
  };

  const updateServiceCategory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.map((category, i) => 
        i === index ? { ...category, [field]: value } : category
      )
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        if (onSuccess) {
          onSuccess(data.vendor);
        }
        if (onClose) {
          onClose();
        }
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            step <= currentStep 
              ? 'bg-yellow-600 border-yellow-600 text-white' 
              : 'border-gray-300 text-gray-300'
          }`}>
            {step < currentStep ? '✓' : step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-yellow-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FaUser className="text-4xl text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Personal Information</h2>
        <p className="text-gray-300">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          placeholder="Enter your email address"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Phone Number *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          placeholder="Enter your phone number"
        />
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>

    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FaBuilding className="text-4xl text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Business Information</h2>
        <p className="text-gray-300">Tell us about your business</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Business Name *</label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          placeholder="Enter your business name"
        />
        {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Business Type *</label>
        <select
          value={formData.businessType}
          onChange={(e) => handleInputChange('businessType', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
        >
          <option value="">Select business type</option>
          {businessTypes.map(type => (
            <option key={type.value} value={type.value} className="bg-gray-800">
              {type.label}
            </option>
          ))}
        </select>
        {errors.businessType && <p className="text-red-400 text-sm mt-1">{errors.businessType}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Business Registration Number</label>
          <input
            type="text"
            value={formData.businessRegistrationNumber}
            onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter registration number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Tax ID</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter tax ID"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FaMapMarkerAlt className="text-4xl text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Address Information</h2>
        <p className="text-gray-300">Where is your business located?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Street Address *</label>
        <input
          type="text"
          value={formData.address.street}
          onChange={(e) => handleInputChange('address.street', e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          placeholder="Enter street address"
        />
        {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">City *</label>
          <input
            type="text"
            value={formData.address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter city"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">State *</label>
          <input
            type="text"
            value={formData.address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter state"
          />
          {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Country *</label>
          <input
            type="text"
            value={formData.address.country}
            onChange={(e) => handleInputChange('address.country', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter country"
          />
          {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">ZIP Code *</label>
          <input
            type="text"
            value={formData.address.zipCode}
            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            placeholder="Enter ZIP code"
          />
          {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FaCog className="text-4xl text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Service Categories</h2>
        <p className="text-gray-300">What services do you provide?</p>
      </div>

      {formData.serviceCategories.map((category, index) => (
        <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Service Category {index + 1}</h3>
            {formData.serviceCategories.length > 1 && (
              <button
                type="button"
                onClick={() => removeServiceCategory(index)}
                className="text-red-400 hover:text-red-300"
              >
                <FaTrash />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category *</label>
              <select
                value={category.category}
                onChange={(e) => updateServiceCategory(index, 'category', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="">Select a category</option>
                {serviceCategories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800">
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
              {errors[`category_${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`category_${index}`]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description *</label>
              <textarea
                value={category.description}
                onChange={(e) => updateServiceCategory(index, 'description', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                placeholder="Describe your services in this category"
                rows={3}
              />
              {errors[`description_${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`description_${index}`]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Experience Level *</label>
                <select
                  value={category.experience}
                  onChange={(e) => updateServiceCategory(index, 'experience', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value} className="bg-gray-800">
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors[`experience_${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`experience_${index}`]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={category.yearsOfExperience}
                  onChange={(e) => updateServiceCategory(index, 'yearsOfExperience', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  placeholder="Enter years of experience"
                />
                {errors[`years_${index}`] && <p className="text-red-400 text-sm mt-1">{errors[`years_${index}`]}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addServiceCategory}
        className="w-full py-3 px-4 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <FaPlus /> Add Another Service Category
      </button>

      {errors.serviceCategories && <p className="text-red-400 text-sm">{errors.serviceCategories}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-[#110400] to-[#0C0300] rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-white">Vendor Onboarding</h1>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
