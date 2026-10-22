import { calendarioPagoRepository }
from '@repositories/calendarioPagoRepository';
import { authRepository } from '@repositories/authRepository';
import { CalendarioPago, CalendarioPagoInput } from '@models/index';
import {
  calendarioPagoInputSchema,
  calendarioPagoUpdateSchema,
} from '@schemas/financialSchemas';

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


 async crear(data:CalendarioPagoInput){

   calendarioPagoInputSchema.parse(data);

   return calendarioPagoRepository.create({
     ...data,
     servicio: data.servicio.trim(),
     created_by: await getAuthenticatedUserId(),
   });

 },


 async actualizar(
   id:string,
   data:Partial<Pick<CalendarioPago, 'fecha' | 'servicio' | 'monto' | 'pago'>>
 ){
   const updates = calendarioPagoUpdateSchema.parse(data);
   return calendarioPagoRepository.update(id, updates, await getAuthenticatedUserId());

 },


 async eliminar(id:string){

   return calendarioPagoRepository.delete(id, await getAuthenticatedUserId());

 },


 async marcarPagado(id:string){

   return calendarioPagoRepository.marcarPagado(id, await getAuthenticatedUserId());

 }

};
