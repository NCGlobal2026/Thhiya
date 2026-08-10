import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const encode = (value: string) => encodeURIComponent(value.trim());

export interface Service {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  success: boolean;
  data: Service | Service[];
  count?: number;
  message?: string;
  error?: string;
}

/**
 * Get all services
 */
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/services`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Get service by slug
 */
export const getServiceBySlug = async (slug: string): Promise<Service> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/services/${encode(slug)}`);
    if (response.data.success && !Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Service not found');
  } catch (error) {
    console.error(`Error fetching service ${slug}:`, error);
    throw error;
  }
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (category: string): Promise<Service[]> => {
  try {
    const response = await axios.get<ServiceResponse>(`${API_BASE_URL}/services/category/${encode(category)}`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error(`Error fetching services for category ${category}:`, error);
    throw error;
  }
};
