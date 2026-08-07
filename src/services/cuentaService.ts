import { cuentaRepository } from '@repositories/cuentaRepository';


export const cuentaService = {


 async getCuentas(userId:string){

    return await cuentaRepository.findAll(
      userId
    );

 },


 async getCuenta(id:string){

    return await cuentaRepository.findById(
      id
    );

 },


 async crearCuenta(data:any){

    if(!data.nombre){
      throw new Error(
        'Nombre de cuenta requerido'
      );
    }


    return await cuentaRepository.create(
      data
    );

 },


 async actualizarCuenta(
    id:string,
    data:any
 ){

    return await cuentaRepository.update(
      id,
      data
    );

 },


 async eliminarCuenta(id:string){

    return await cuentaRepository.delete(id);

 }

};