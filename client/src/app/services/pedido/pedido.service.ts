import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private http: HttpClient
  ) { }

  uri: String = 'http://localhost:8080/';

  getFactura(idCliente: number, idPedido: number): any{
    
    const httpOptions = {
      'responseType'  : 'arraybuffer' as 'json'
       //'responseType'  : 'blob' as 'json'        //This also worked
    };
    

    return this.http.get(this.uri+'factura/'+idCliente+'/'+idPedido/*,httpOptions*/);

  }

}
