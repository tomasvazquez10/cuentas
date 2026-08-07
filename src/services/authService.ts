import { authRepository } from '@repositories/authRepository';
import { perfilRepository } from '@repositories/perfilRepository';
import { User } from '@supabase/supabase-js';


export const authService = {


  async signIn(
    email:string,
    password:string
  ){

    return await authRepository.login(
      email,
      password
    );

  },

  async signUp(
    email:string,
    password:string,
    nombre?:string
  ){

    if(!email || !password){
      throw new Error(
        'Email y contraseña son obligatorios'
      );
    }


    if(password.length < 6){
      throw new Error(
        'La contraseña debe tener al menos 6 caracteres'
      );
    }


    const user =
      await authRepository.register(
        email.trim(),
        password
      );

    if(user){

      await perfilRepository.create({

        id:user.id,

        nombre:
          nombre ?? '',

        email:
          email.trim()

      });

    }
    return user;
  },

  async getCurrentUser(){

    return await authRepository.currentUser();

  },


  async getProfile(userId:string){

    return await perfilRepository.getById(
      userId
    );

  },


  async signOut(){

    return await authRepository.logout();

  },

onAuthStateChanged(
  callback:(user: User | null)=>void
){

  return authRepository.onAuthChange(
    callback
  );

}

};