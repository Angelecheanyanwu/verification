export interface User {
    nin: string; 
    fingerprints: Record<string, string>; 
}

export interface EnrollmentFormData {
  nin: string;
  right_thumb: File | null;
  right_index: File | null;
  right_middle: File | null;
  right_ring: File | null;
  right_little: File | null;
  left_thumb: File | null;
  left_index: File | null;
  left_middle: File | null;
  left_ring: File | null;
  left_little: File | null;
}