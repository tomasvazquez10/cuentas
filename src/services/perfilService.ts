import { perfilRepository } from '@repositories/perfilRepository';


export const perfilService = {


 async getPerfil(userId:string){

    return await perfilRepository.getById(userId);

 },


 async createPerfil(data:any){

    if(!data.nombre){
      throw new Error(
        'El nombre es obligatorio'
      );
    }


    return await perfilRepository.create(data);

 },


 async updatePerfil(
    id:string,
    data:any
 ){

    return await perfilRepository.update(
      id,
      data
    );

 }

};