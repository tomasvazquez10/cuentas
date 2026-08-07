import { supabase } from '../lib/supabase';

export const calendarioPagoRepository = {


 async findAll(){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .select('*')
     .order('fecha');


   if(error) throw error;


   return data;

 },


 async findPendientes(){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .select('*')
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
    pago:any
 ){

   const {data,error}=await supabase
     .from('calendario_pagos')
     .update(pago)
     .eq('id',id)
     .select()
     .single();


   if(error) throw error;


   return data;

 },


 async delete(id:string){

   const {error}=await supabase
     .from('calendario_pagos')
     .delete()
     .eq('id',id);


   if(error) throw error;

 },


 async marcarPagado(id:string){

   return this.update(
     id,
     {
       pago:true
     }
   );

 }

};