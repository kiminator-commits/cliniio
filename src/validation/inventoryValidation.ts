import * as Yup from 'yup';
import * as z from 'zod';

export const inventoryItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(0, 'Quantity cannot be negative'),
  location: Yup.string().required('Location is required'),
});

const schema = z.object({
  email: z.string().email('Invalid email').nonempty('Email is required'),
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
