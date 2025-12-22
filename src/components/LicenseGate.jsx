import React, { useState } from 'react';

const LicenseGate = ({ onActivated }) => {
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleActivate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Call the secure bridge exposed in preload.js
            const result = await window.myAppAPI.activateLicense(licenseKey);

            if (result.success) {
                onActivated();
            } else {
                setError(result.error || 'Invalid license key');
            }
        } catch (err) {
            setError('Activation failed. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
                    <p className="text-gray-400">Please enter your license key to continue.</p>
                </div>

                <form onSubmit={handleActivate} className="space-y-6">
                    <div>
                        <label htmlFor="license" className="block text-sm font-medium text-gray-300 mb-2">
                            License Key
                        </label>
                        <input
                            type="text"
                            id="license"
                            value={licenseKey}
                            onChange={(e) => setLicenseKey(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center animate-shake">
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg transition-all duration-200 
                            ${loading
                                ? 'bg-blue-600/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:transform active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </span>
                        ) : 'Activate License'}
                    </button>

                    <div className="text-center mt-4">
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-400 transition">Where can I find my key?</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenseGate;
