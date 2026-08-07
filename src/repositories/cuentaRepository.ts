import { supabase } from '../lib/supabase';


export const cuentaRepository = {


  async findAll(userId:string){

    const {data,error}=await supabase
      .from('cuentas')
      .select('*')
      .eq('user_id',userId)
      .order('nombre');


    if(error) throw error;

    return data;
  },


  async findById(id:string){

    const {data,error}=await supabase
      .from('cuentas')
      .select('*')
      .eq('id',id)
      .single();


    if(error) throw error;

    return data;
  },


  async create(cuenta:any){

    const {data,error}=await supabase
      .from('cuentas')
      .insert(cuenta)
      .select()
      .single();


    if(error) throw error;

    return data;
  },


  async update(id:string, cuenta:any){

    const {data,error}=await supabase
      .from('cuentas')
      .update(cuenta)
      .eq('id',id)
      .select()
      .single();


    if(error) throw error;

    return data;
  },


  async delete(id:string){

    const {error}=await supabase
      .from('cuentas')
      .delete()
      .eq('id',id);


    if(error) throw error;

  }

};