export interface LeadData {
  type: string;
  name?: string;
  phone: string;
  address?: string;
  comment?: string;
  houseType?: string;
  callTime?: string;
  category?: string;
  supportValue?: string;
  otherValue?: string;
    tariffName?: string; // Добавьте это
  tariffPrice?: number; // Добавьте это
  tariffSpeed?: number; // Добавьте это
}

export async function submitLead(data: LeadData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit lead');
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting lead:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 