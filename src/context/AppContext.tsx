import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react';

import { Movimiento, CalendarioPago } from '@models/index';

import { movimientoService } from '@services/movimientoService';
import { calendarioPagoService } from '@services/calendarioPagoService';

import { useAuth } from '@context/AuthContext';


interface AppContextType {

  movimientos: Movimiento[];

  loadMovimientos: () => Promise<void>;

  addMovimiento: (
    movimiento: Omit<
      Movimiento,
      'id' | 'created_at'
    >
  ) => Promise<void>;

  deleteMovimiento: (
    id:string
  ) => Promise<void>;


  updateMovimiento: (
    id:string,
    updates:Partial<Movimiento>
  ) => Promise<void>;



  pagos: CalendarioPago[];

  loadPagos: () => Promise<void>;

  addPago: (
    pago:Omit<
      CalendarioPago,
      'id' | 'created_at'
    >
  )=>Promise<void>;


  deletePago:(
    id:string
  )=>Promise<void>;


  updatePago:(
    id:string,
    updates:Partial<CalendarioPago>
  )=>Promise<void>;



  loadingMovimientos:boolean;

  loadingPagos:boolean;

}



const AppContext =
createContext<AppContextType | undefined>(
  undefined
);



export const AppProvider = ({
  children
}:{
  children:React.ReactNode
})=>{


const {
  user
}=useAuth();



const [movimientos,setMovimientos]=
useState<Movimiento[]>([]);


const [pagos,setPagos]=
useState<CalendarioPago[]>([]);



const [
 loadingMovimientos,
 setLoadingMovimientos
]=useState(false);



const [
 loadingPagos,
 setLoadingPagos
]=useState(false);

const loadMovimientos =
useCallback(async()=>{

  if(!user) return;
  setLoadingMovimientos(true);

  try{
    const data =
      await movimientoService.listar();
    setMovimientos(data);

  }
  finally{
    setLoadingMovimientos(false);
  }

},[user]);

const addMovimiento =
useCallback(async(
 movimiento: Omit<
   Movimiento,
   'id' | 'created_at' | 'created_by'
 >
)=>{

 if(!user) return;

 const nuevo =
 await movimientoService.crear(
    movimiento
 );

 setMovimientos(prev=>[
    nuevo,
    ...prev
 ]);


},[user]);

const deleteMovimiento =
useCallback(async(id:string)=>{

 await movimientoService.eliminar(id);

 setMovimientos(prev=>
    prev.filter(
      m=>m.id!==id
    )
 );

},[]);

const updateMovimiento =
useCallback(async(
 id:string,
 updates:any
)=>{


 const actualizado =
 await movimientoService.actualizar(
    id,
    updates
 );


 setMovimientos(prev=>
    prev.map(
      m=>m.id===id
      ? actualizado
      :m
    )
 );


},[]);




// =====================
// PAGOS
// =====================


const loadPagos =
useCallback(async()=>{


 if(!user) return;


 setLoadingPagos(true);


 try{

const data = await calendarioPagoService.pendientes();
 setPagos(data);

 }
 finally{

 setLoadingPagos(false);

 }


},[user]);





const addPago =
useCallback(async(
 pago:any
)=>{


 if(!user) return;

const nuevo =
 await calendarioPagoService.crear(
    pago
 );

 setPagos(prev=>

   [
    ...prev,
    nuevo
   ]
   .sort(
    (a,b)=>
    new Date(a.fecha).getTime()
    -
    new Date(b.fecha).getTime()
   )

 );


},[user]);





const deletePago =
useCallback(async(
 id:string
)=>{


 await calendarioPagoService.eliminar(
    id
 );


 setPagos(prev=>
   prev.filter(
    p=>p.id!==id
   )
 );


},[]);





const updatePago =
useCallback(async(
 id:string,
 updates:any
)=>{


 const actualizado =
 await calendarioPagoService.actualizar(
    id,
    updates
 );


 setPagos(prev=>
   prev.map(
    p=>p.id===id
    ? actualizado
    :p
   )
 );


},[]);





return (

<AppContext.Provider
 value={{

  movimientos,

  loadMovimientos,

  addMovimiento,

  deleteMovimiento,

  updateMovimiento,


  pagos,

  loadPagos,

  addPago,

  deletePago,

  updatePago,


  loadingMovimientos,

  loadingPagos

 }}
>

{children}

</AppContext.Provider>

);


};





export const useApp=()=>{


const context=
useContext(AppContext);


if(!context){

 throw new Error(
  'useApp must be used within AppProvider'
 );

}


return context;


};