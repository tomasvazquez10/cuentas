import { authRepository } from '@repositories/authRepository';
import { perfilRepository } from '@repositories/perfilRepository';
import { User } from '@supabase/supabase-js';
import { signInSchema, signUpInputSchema } from '@schemas/authSchemas';


export const authService = {


  async signIn(
    email:string,
    password:string
  ){

    const credentials = signInSchema.parse({ email, password });
    return authRepository.login(credentials.email, credentials.password);

  },

  async signUp(
    email:string,
    password:string,
    nombre?:string
  ){

    const input = signUpInputSchema.parse({ email, password, nombre });

    const user =
      await authRepository.register(
        input.email,
        input.password
      );

    if(user){

      await perfilRepository.create({

        id:user.id,

        nombre:
          input.nombre,

        email:
          input.email

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