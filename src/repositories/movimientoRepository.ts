import { supabase } from '../lib/supabase';


export const movimientoRepository = {


  async findAll() {

    const { data, error } =
      await supabase
        .from('movimientos')
        .select('*')
        .order('fecha', {
          ascending: false
        });


    if (error) throw error;

    return data;

  },


  async findById(id:string) {

    const { data, error } =
      await supabase
        .from('movimientos')
        .select('*')
        .eq('id', id)
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
    id:string,
    movimiento:any
  ){

    const { data,error } =
      await supabase
        .from('movimientos')
        .update(movimiento)
        .eq('id',id)
        .select()
        .single();


    if(error) throw error;

    return data;

  },


  async delete(id:string){

    const { error } =
      await supabase
        .from('movimientos')
        .delete()
        .eq('id',id);


    if(error) throw error;

  }


};