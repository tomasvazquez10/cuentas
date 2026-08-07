import { categoriaRepository } from '@repositories/categoriaRepository';


export const categoriaService = {


 async listar(userId:string){

    return categoriaRepository.findAll(
      userId
    );

 },


 async crear(data:any){

    if(!data.nombre){
      throw new Error(
        'Nombre requerido'
      );
    }


    return categoriaRepository.create(
      data
    );

 },


 async eliminar(id:string){

    return categoriaRepository.delete(
      id
    );

 }

};