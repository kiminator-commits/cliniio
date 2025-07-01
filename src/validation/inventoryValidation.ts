import * as Yup from 'yup';

export const inventoryItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  category: Yup.string().required('Category is required'),
  quantity: Yup.number().required('Quantity is required').min(0, 'Quantity cannot be negative'),
  location: Yup.string().required('Location is required'),
});
