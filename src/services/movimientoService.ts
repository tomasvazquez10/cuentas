import { movimientoRepository } 
from '@repositories/movimientoRepository';
import { authRepository } from '@repositories/authRepository';
import { MovimientoInput, Movimiento } from '@models/index';
import {
  movimientoInputSchema,
  movimientoUpdateSchema,
} from '@schemas/financialSchemas';

const getAuthenticatedUserId = async () => {
  const user = await authRepository.currentUser();
  if (!user) throw new Error('Debes iniciar sesion para ver tus movimientos');
  return user.id;
};


export const movimientoService = {


 async listar(){
   return movimientoRepository.findAll(await getAuthenticatedUserId());

 },


 async crear(data:MovimientoInput){
   const movimiento = movimientoInputSchema.parse(data);

   return movimientoRepository.create({
     ...movimiento,
     created_by: await getAuthenticatedUserId(),
   });

 },


 async actualizar(
    id:string,
    data:Partial<MovimientoInput>
 ){
   const updates = movimientoUpdateSchema.parse(data);
   return movimientoRepository.update(id, updates, await getAuthenticatedUserId());

 },


 async eliminar(id:string){

   return movimientoRepository.delete(id, await getAuthenticatedUserId());

 },


 async balance(){

   const movimientos =
      await movimientoRepository.findAll(await getAuthenticatedUserId());


   const ingresos =
      movimientos
      .filter(
        m=>m.tipo==='ENTRADA'
      )
      .reduce(
        (sum,m)=>sum+Number(m.monto),
        0
      );


   const gastos =
      movimientos
      .filter(m=>m.tipo!=='ENTRADA')
      .reduce(
        (sum,m)=>sum+Number(m.monto),
        0
      );


   return {
      ingresos,
      gastos,
      balance: ingresos-gastos
   };

 }

};
