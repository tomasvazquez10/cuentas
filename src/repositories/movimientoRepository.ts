import { supabase } from '../lib/supabase';


export const movimientoRepository = {


  async findAll(userId: string) {

    const { data, error } =
      await supabase
        .from('movimientos')
        .select('*')
        .eq('created_by', userId)
        .order('fecha', {
          ascending: false
        });


    if (error) throw error;

    return data;

  },


  async findById(id: string, userId: string) {

    const { data, error } =
      await supabase
        .from('movimientos')
        .select('*')
        .eq('id', id)
        .eq('created_by', userId)
        .single();


    if (error) throw error;

    return data;

  },


  async create(movimiento:any) {

    const { data, error } =
      await supabase
        .from('movimientos')
        .insert(movimiento)
        .select()
        .single();


    if(error) throw error;

    return data;

  },


  async update(
    id: string,
    movimiento: any,
    userId: string
  ){

    const { data,error } =
      await supabase
        .from('movimientos')
        .update(movimiento)
        .eq('id',id)
        .eq('created_by', userId)
        .select()
        .single();


    if(error) throw error;

    return data;

  },


  async delete(id: string, userId: string) {

    const { error } =
      await supabase
        .from('movimientos')
        .delete()
        .eq('id', id)
        .eq('created_by', userId);


    if(error) throw error;

  }


};
