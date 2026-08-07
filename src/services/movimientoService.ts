import { movimientoRepository } 
from '@repositories/movimientoRepository';


export const movimientoService = {


 async listar(){

   return movimientoRepository.findAll();

 },


 async crear(data:any){

   if(!data.fecha)
      throw new Error('Fecha requerida');


   if(!data.concepto)
      throw new Error('Concepto requerido');


   if(!data.monto)
      throw new Error('Monto requerido');


   return movimientoRepository.create(data);

 },


 async actualizar(
    id:string,
    data:any
 ){

   return movimientoRepository.update(
      id,
      data
   );

 },


 async eliminar(id:string){

   return movimientoRepository.delete(id);

 },


 async balance(){

   const movimientos =
      await movimientoRepository.findAll();


   const ingresos =
      movimientos
      .filter(
        m=>m.tipo==='INGRESO'
      )
      .reduce(
        (sum,m)=>sum+Number(m.monto),
        0
      );


   const gastos =
      movimientos
      .filter(
        m=>m.tipo==='GASTO'
      )
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