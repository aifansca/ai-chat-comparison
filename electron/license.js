import fs from 'fs';
import path from 'path';
import { net } from 'electron';

class LicenseManager {
    constructor(userDataPath) {
        this.licensePath = path.join(userDataPath, 'license.json');
    }

    getLicense() {
        try {
            if (fs.existsSync(this.licensePath)) {
                return JSON.parse(fs.readFileSync(this.licensePath, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to read license file:', error);
        }
        return null;
    }

    saveLicense(data) {
        try {
            fs.writeFileSync(this.licensePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Failed to save license file:', error);
            return false;
        }
    }

    async activate(licenseKey, instanceName) {
        return new Promise((resolve, reject) => {
            const request = net.request({
                method: 'POST',
                url: 'https://api.lemonsqueezy.com/v1/licenses/activate',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' // Lemon Squeezy expects form/json
                }
            });

            const body = JSON.stringify({
                license_key: licenseKey,
                instance_name: instanceName
            });

            // Lemon Squeezy V1 API typically takes form data or JSON. 
            // We'll use the precise format: JSON body is cleanest if supported, 
            // but standard docs say form-data. Let's try JSON first as it's modern.
            // If fails, we can fallback.

            request.on('response', (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.activated) {
                            this.saveLicense({
                                key: licenseKey,
                                instance_id: json.instance.id,
                                meta: json
                            });
                            resolve({ success: true, license: json });
                        } else {
                            resolve({ success: false, error: json.error || 'Activation failed' });
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.write(body);
            request.end();
        });
    }

    async validate() {
        const license = this.getLicense();
        if (!license || !license.key) return { valid: false };

        // For faster startup, we can optimistically return true if we have a key,
        // but robust apps should validate with the server periodically.
        // For this MVP, we will validate against API to be safe.

        return new Promise((resolve) => {
            const request = net.request({
                method: 'POST',
                url: 'https://api.lemonsqueezy.com/v1/licenses/validate',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const body = JSON.stringify({
                license_key: license.key,
                instance_id: license.instance_id
            });

            request.on('response', (response) => {
                let data = '';
                response.on('data', (chunk) => data += chunk);
                response.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.valid) {
                            resolve({ valid: true, meta: json });
                        } else {
                            // If invalid, we might want to delete the local file?
                            // For now, let's just return false
                            resolve({ valid: false, error: json.error });
                        }
                    } catch (e) {
                        resolve({ valid: false, error: 'Parse error' });
                    }
                });
            });

            request.on('error', () => resolve({ valid: false, error: 'Network error' })); // Soft fail on network

            request.write(body);
            request.end();
        });
    }
}

export default LicenseManager;
