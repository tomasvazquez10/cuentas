import { supabase } from '../lib/supabase';

export const categoriaRepository = {


 async findAll(userId:string){

   const {data,error}=await supabase
     .from('categorias')
     .select('*')
     .eq('user_id',userId)
     .order('nombre');


   if(error) throw error;


   return data;
 },


 async create(categoria:any){

   const {data,error}=await supabase
     .from('categorias')
     .insert(categoria)
     .select()
     .single();


   if(error) throw error;


   return data;
 },


 async delete(id:string){

   const {error}=await supabase
     .from('categorias')
     .delete()
     .eq('id',id);


   if(error) throw error;

 }

};