
import { AnalysisResult, DataSource } from '../types';

/**
 * Fetches brand analysis by calling a secure backend service.
 * @param brandName 
 * @param source 
 * @returns 
 */
export const fetchBrandAnalysis = async (brandName: string, source: DataSource): Promise<AnalysisResult> => {

    const localApiUrl = 'http://localhost:3001/api/analyze';
    const productionApiUrl = 'https://omnirepute.samuelninsiima.com/3001/api/analyze';

    const backendUrl = window.location.hostname === 'localhost' ? localApiUrl : productionApiUrl;
    
    console.log(`Requesting analysis from backend for brand: ${brandName}, source: ${source}`);

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ brandName, source }),
        });

        if (!response.ok) {
            //JSON error message from the backend
            let errorMessage = `Backend server responded with status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Response was not JSON, use the status text
                errorMessage = response.statusText;
            }
            throw new Error(errorMessage);
        }

        const result: AnalysisResult = await response.json();
        return result;

    } catch (error) {
        console.error("Error fetching analysis from backend:", error);
        if (error instanceof TypeError) { 
             throw new Error("Could not connect to the analysis service. Please ensure the backend is running and accessible.");
        }
        throw error;
    }
};
