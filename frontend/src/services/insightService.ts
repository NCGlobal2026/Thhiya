import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const encode = (value: string) => encodeURIComponent(value.trim());

export interface SalaryBreakdownItem {
  label: string;
  amount: string;
  percent?: string;
  note?: string;
}

export interface PayrollInsightItem {
  title: string;
  description: string;
}

export interface EmploymentRequirementPoint {
  subtitle?: string;
  text: string;
}

export interface BusinessGuideSection {
  title: string;
  text: string;
  icon?: string;
}

export interface Insight {
  _id: string;
  service: string;
  country: string;
  salaryBreakdown: {
    title: string;
    subtitle: string;
    description: string;
    breakdown: SalaryBreakdownItem[];
  };
  payrollInsights: {
    heading: string;
    image?: string;
    items: PayrollInsightItem[];
  };
  employmentRequirements: {
    title: string;
    image?: string;
    points: EmploymentRequirementPoint[];
  };
  businessGuide: {
    title: string;
    subtitle: string;
    description: string;
    flag?: string;
    sections: BusinessGuideSection[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface InsightResponse {
  success: boolean;
  data: Insight | Insight[];
  message?: string;
  error?: string;
}

/**
 * Get all insights
 */
export const getAllInsights = async (): Promise<Insight[]> => {
  try {
    const response = await axios.get<InsightResponse>(`${API_BASE_URL}/insights`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Invalid response format');
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

/**
 * Get insights by service
 */
export const getInsightsByService = async (service: string): Promise<Insight[]> => {
  try {
    const cleanedService = service.replace(/\s+services?$/i, '').trim();
    const response = await axios.get<InsightResponse>(`${API_BASE_URL}/insights/service/${encode(cleanedService)}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Invalid response format');
  } catch (error) {
    console.error(`Error fetching insights for service ${service}:`, error);
    throw error;
  }
};

/**
 * Get insights by country
 */
export const getInsightsByCountry = async (country: string): Promise<Insight[]> => {
  try {
    const response = await axios.get<InsightResponse>(`${API_BASE_URL}/insights/country/${encode(country)}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Invalid response format');
  } catch (error) {
    console.error(`Error fetching insights for country ${country}:`, error);
    throw error;
  }
};

/**
 * Get insight by service and country
 */
export const getInsightByServiceAndCountry = async (service: string, country: string): Promise<Insight> => {
  try {
    const cleanedService = service.replace(/\s+services?$/i, '').trim();
    const response = await axios.get<InsightResponse>(`${API_BASE_URL}/insights/pair/${encode(cleanedService)}/${encode(country)}`);
    if (response.data.success && !Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Insight not found');
  } catch (error) {
    console.error(`Error fetching insight for ${service} in ${country}:`, error);
    throw error;
  }
};
