import { calendarioPagoRepository }
from '@repositories/calendarioPagoRepository';


export const calendarioPagoService = {


 async listar(){

   return calendarioPagoRepository.findAll();

 },


 async pendientes(){

   return calendarioPagoRepository.findPendientes();

 },


 async crear(data:any){

   if(!data.servicio)
      throw new Error(
        'Servicio requerido'
      );


   if(!data.monto)
      throw new Error(
        'Monto requerido'
      );


   return calendarioPagoRepository.create(data);

 },


 async actualizar(
   id:string,
   data:any
 ){

   return calendarioPagoRepository.update(
     id,
     data
   );

 },


 async eliminar(id:string){

   return calendarioPagoRepository.delete(id);

 },


 async marcarPagado(id:string){

   return calendarioPagoRepository.marcarPagado(id);

 }

};