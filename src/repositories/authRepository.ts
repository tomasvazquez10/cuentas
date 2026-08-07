import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';


export const authRepository = {


 async login(email:string,password:string){

   const {data,error}=await supabase.auth
     .signInWithPassword({
        email,
        password
     });


   if(error) throw error;


   return data.user;
 },


 async register(email:string,password:string){

   const {data,error}=await supabase.auth
    .signUp({
      email,
      password
    });


   if(error) throw error;


   return data.user;
 },


 async logout(){

   const {error}=await supabase.auth.signOut();


   if(error) throw error;

 },


 async currentUser(){

   const {
     data:{
       session
     }
   }=await supabase.auth.getSession();


   return session?.user ?? null;
 },


 onAuthChange(
    callback:(user:User|null)=>void
  ){

    return supabase.auth.onAuthStateChange(
      (_event,session)=>{

        callback(
          session?.user ?? null
        );

      }
    );

  }

};