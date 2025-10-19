import * as z from 'zod';

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number()
    .min(0, 'Quantity cannot be negative'),
  location: z.string().min(1, 'Location is required'),
});

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const validateForm = (data: { email: string; password: string }) => {
  try {
    schema.parse(data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors;
    }
    return [];
  }
};
