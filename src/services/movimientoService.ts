import { movimientoRepository } 
from '@repositories/movimientoRepository';
import { authRepository } from '@repositories/authRepository';

const getAuthenticatedUserId = async () => {
  const user = await authRepository.currentUser();
  if (!user) throw new Error('Debes iniciar sesion para ver tus movimientos');
  return user.id;
};


export const movimientoService = {


 async listar(){
   return movimientoRepository.findAll(await getAuthenticatedUserId());

 },


 async crear(data:any){

   if(!data.fecha)
      throw new Error('Fecha requerida');


   if(!data.concepto)
      throw new Error('Concepto requerido');


   if(!data.monto)
      throw new Error('Monto requerido');


   return movimientoRepository.create({
     ...data,
     created_by: await getAuthenticatedUserId(),
   });

 },


 async actualizar(
    id:string,
    data:any
 ){

   const { created_by, ...movimiento } = data;
   return movimientoRepository.update(id, movimiento, await getAuthenticatedUserId());

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
