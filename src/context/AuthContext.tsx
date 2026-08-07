import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { Perfil } from '@models/index';

import { authService } from '@services/authService';


interface AuthContextType {

  user: Perfil | null;

  isLoading: boolean;

  isSignedIn: boolean;


  signIn(
    email:string,
    password:string
  ):Promise<void>;


  signUp(
    email:string,
    password:string,
    nombre?:string
  ):Promise<void>;


  signOut():Promise<void>;

}



const AuthContext =
createContext<AuthContextType | undefined>(
  undefined
);



export const AuthProvider = ({
 children
}:{
 children:React.ReactNode
})=>{


const [user,setUser]=
useState<Perfil|null>(null);


const [isLoading,setIsLoading]=
useState(true);





useEffect(()=>{


const loadSession = async()=>{


 try{

  const authUser =
  await authService.getCurrentUser();

  if(authUser){

  const perfil =
  await authService.getProfile(
    authUser.id
  );

  setUser(perfil);

}


 }
 catch(error){

   console.error(
    'Error loading session',
    error
   );

 }
 finally{

   setIsLoading(false);

 }

};



loadSession();



const {
 data:{
   subscription
 }
}=authService.onAuthStateChanged(
 async(authUser)=>{


   if(authUser){

     const perfil =
       await authService.getProfile(
          authUser.id
       );


     setUser(perfil);


   }else{

     setUser(null);

   }

 }
);



return ()=>{

 subscription.unsubscribe();

};


},[]);


const signIn =
async(
 email:string,
 password:string
)=>{


setIsLoading(true);


try{
await authService.signIn(
  email,
  password
);


const authUser =
await authService.getCurrentUser();


if(authUser){

  const perfil =
    await authService.getProfile(
      authUser.id
    );


  setUser(perfil);

}
}
finally{

 setIsLoading(false);

}


};






const signUp =
async(
 email:string,
 password:string,
 nombre?:string
)=>{


setIsLoading(true);


try{


 await authService.signUp(
   email,
   password,
   nombre
 );


}
finally{

 setIsLoading(false);

}


};






const signOut =
async()=>{


setIsLoading(true);


try{

 await authService.signOut();

 setUser(null);


}
finally{

 setIsLoading(false);

}


};







return (

<AuthContext.Provider
 value={{

  user,

  isLoading,

  isSignedIn:!!user,


  signIn,

  signUp,

  signOut

 }}
>

{children}

</AuthContext.Provider>

);


};







export const useAuth=()=>{


const context=
useContext(AuthContext);


if(!context){

 throw new Error(
  'useAuth must be used within AuthProvider'
 );

}


return context;


};