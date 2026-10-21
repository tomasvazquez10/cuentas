import { calendarioPagoRepository }
from '@repositories/calendarioPagoRepository';
import { authRepository } from '@repositories/authRepository';
import { CalendarioPago } from '@models/index';

const getAuthenticatedUserId = async () => {
  const user = await authRepository.currentUser();
  if (!user) throw new Error('Debes iniciar sesion para ver tus pagos');
  return user.id;
};


export const calendarioPagoService = {


 async listar(){

   return calendarioPagoRepository.findAll(await getAuthenticatedUserId());

 },


 async pendientes(){

   return calendarioPagoRepository.findPendientes(await getAuthenticatedUserId());

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


   return calendarioPagoRepository.create({
     ...data,
     created_by: await getAuthenticatedUserId(),
   });

 },


 async actualizar(
   id:string,
   data:Partial<Pick<CalendarioPago, 'fecha' | 'servicio' | 'monto' | 'pago'>>
 ){

   return calendarioPagoRepository.update(id, data, await getAuthenticatedUserId());

 },


 async eliminar(id:string){

   return calendarioPagoRepository.delete(id, await getAuthenticatedUserId());

 },


 async marcarPagado(id:string){

   return calendarioPagoRepository.marcarPagado(id, await getAuthenticatedUserId());

 }

};
