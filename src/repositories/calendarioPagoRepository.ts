import { supabase } from '../lib/supabase';

export const calendarioPagoRepository = {


 async findAll(userId: string){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .select('*')
     .eq('created_by', userId)
     .order('fecha');


   if(error) throw error;


   return data;

 },


 async findPendientes(userId: string){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .select('*')
     .eq('created_by', userId)
     .eq('pago',false)
     .order('fecha');


   if(error) throw error;


   return data;

 },


 async create(pago:any){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .insert(pago)
     .select()
     .single();


   if(error) throw error;


   return data;

 },


 async update(
    id:string,
    pago:any,
    userId: string
 ){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .update(pago)
     .eq('id',id)
     .eq('created_by', userId)
     .select()
     .single();


   if(error) throw error;


   return data;

 },


 async delete(id:string, userId: string){

   const {error}=await supabase
     .from('calendario_pagos')
     .delete()
     .eq('id',id)
     .eq('created_by', userId);


   if(error) throw error;

 },


 async marcarPagado(id:string, userId: string){

   return this.update(
     id,
     { pago:true },
     userId
   );

 }

};
