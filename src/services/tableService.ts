import supabase from '../lib/supabaseClient';

export const getAll = async (tableName: string) => {
  return await supabase.from(tableName).select('*');
};

export const getById = async (tableName: string, id: string) => {
  return await supabase.from(tableName).select('*').eq('id', id).single();
};

export const insert = async (tableName: string, data: Record<string, unknown>) => {
  return await supabase.from(tableName).insert(data);
};

export const update = async (tableName: string, id: string, data: Record<string, unknown>) => {
  return await supabase.from(tableName).update(data).eq('id', id);
};

export const deleteById = async (tableName: string, id: string) => {
  return await supabase.from(tableName).delete().eq('id', id);
};
