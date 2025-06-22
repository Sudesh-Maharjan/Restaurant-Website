// Script to debug customers data fetching
import api from '@/services/api';

const API_URL = '/customers';

async function fetchCustomers() {
  try {
    console.log('Attempting to fetch customers...');
    const response = await api.get(API_URL);
    console.log('API Response:', response);
    console.log('Customers data:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return null;
  }
}

// Export the function to use in components
export default fetchCustomers;
