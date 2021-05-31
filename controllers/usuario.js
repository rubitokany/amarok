const usuario = require('../models/usuario');
const bcrypt = require('bcrypt-node');
const pedido = require('../models/pedido');

//TEST
const getUsuarios = async (req, res) => {

    await usuario.findOne({},(err,docs)=>{
        
        //console.log("creacion---",docs.fechaPedido);
        //console.log("actualizacion---",docs.fechaModificacionPedido);

        res.status(200).send({
            item:docs
        })

    })

}

const getRol = async (req,res) => {

    const idUsuario = JSON.parse(req.params.id);
    const usuarioLogueado = await usuario.findById(idUsuario);
    
    res.status(200).send({rol:usuarioLogueado.tipo})

};

const pedidosUsuario = async (req,res) => {

    //console.log(req.params.refPedidos.split(','))

    const referenciasPedidos = req.params.refPedidos.split(',');

    await pedido.find({referencia:{$in:referenciasPedidos}},(err,docs) => {
        //console.log(docs)
        res.status(200).send({pedidos:docs})

    });

};

const paginationUsuariosEmpleado = async (req,res) => {
    
    const options = {
        
        page: req.params.page,
        limit: 10
        //sort:{estado:-1}
    
    };
    //{stock:{$lt:6},referencia:500} <--- menor que
    //tipo:{$ne:'administrador'} <---- negacion!!
    await usuario.paginate({tipo:{$not:{$in:['administrador','empleado']}}},options,(err,docs)=>{
        //console.log("asd------",docs.totalDocs);
        res.status(200).send({
            docs
        });
    });
    
};

//paginationUsuariosAdmin
const paginationUsuariosAdmin = async (req,res) => {
    //console.log("holiiiiiiiiiii")
    const options = {
        //empieza por 1
        page: req.params.page,
        limit: 10
        //sort:{estado:-1}
    
    };
    //{stock:{$lt:6},referencia:500} <--- menor que
    //tipo:{$ne:'administrador'} <---- negacion!!
    await usuario.paginate({},options,(err,docs)=>{
        //console.log("asd------",docs.totalDocs);
        res.status(200).send({
            docs
        });
    });
    
};

const modificaPerfil = async (req,res) => {

    let nuevoPerfil = req.body;
    let errors = [];

    const duplicados = await usuario.findOne({$or:[{email: nuevoPerfil.email},{usuario: nuevoPerfil.usuario}]});

    if(duplicados){

        if(duplicados.email === nuevoPerfil.email){

            errors.push('El email ya esta registrado');

        }

        if(duplicados.usuario === nuevoPerfil.usuario){
         
            errors.push('El nombre de usuario ya esta registrado');
            
        }

        return res.status(200).send({error:errors});

    }else{

        //console.log("-------")
        //console.log(nuevoPerfil.password)

        if(nuevoPerfil.password !== undefined){

            bcrypt.hash(nuevoPerfil.password, null, null, async (err, hash) => {
                
                if (!err) {
                    
                    nuevoPerfil.password = hash;

                    //console.log("-------")
                    //console.log(nuevoPerfil.password)

                    const actualizaPerfil = await usuario.findByIdAndUpdate(nuevoPerfil.id,nuevoPerfil,{new: true, upsert:true});

                    res.status(200).send({resul:actualizaPerfil});
                }

            });

        }else{

            //console.log("-------")
            //console.log(nuevoPerfil)

            const actualizaPerfil = await usuario.findByIdAndUpdate(nuevoPerfil.id,nuevoPerfil,{new: true, upsert:true});

            res.status(200).send({resul:actualizaPerfil});

        }

    }

};

const perfil = async (req,res) => {

    const idUsuario = req.body.id;
    const perfil = await usuario.findById(idUsuario);

    const datos = {

        usuario: perfil.usuario,
        telefono: perfil.telefono,
        nombre: perfil.nombre,
        nacimiento: perfil.nacimiento,
        licencia: perfil.licencia,
        email: perfil.email,
        dni: perfil.dni,
        direccion: perfil.direccion,
        apellidos: perfil.apellidos,
        codigoPostal: perfil.codigoPostal,
        password: perfil.password


    }

    res.status(200).send({datos})

};

const crearUsuario = async (req,res) => {

    const data = req.body
    let errors = [];

    for (const key in data) {
        
        if(!data[key]){
            
            errors.push('El campo '+key+' no debe estar vacío.');

        }

    }

    if(errors.length > 0){

        return res.status(200).send({error:errors});

    }

    const duplicados = await usuario.findOne({$or:[{email: data.email},{usuario: data.usuario}]});
    
    if(duplicados){

        if(duplicados.email === data.email){

            errors.push('El email ya esta registrado');

        }

        if(duplicados.usuario === data.usuario){
         
            errors.push('El nombre de usuario ya esta registrado');
            
        }

        return res.status(200).send({error:errors});

    }else{

        await usuario.create(data,(err,user)=>{

            if(err){

                return res.status(200).send({error:'Error al intentar insertar al usuario'},422)
    
            }else{
                
                return res.status(200).send({data:user},200)
    
            }
    
            
        });

    }

}

const deshabilitar = async (req, res) => {

    const idUsuario = req.body.id;
    const actualizaHabilitado = await usuario.findByIdAndUpdate(idUsuario,{habilitado: false},{new: true, upsert:true});

    if(actualizaHabilitado.habilitado){

        res.status(200).send({resul:false});

    }else{

        res.status(200).send({resul:true});

    }

};

const iniciarSesion = async (req,res) => {

    const data = req.body
    let errors = [];

    for (const key in data) {
        
        if(!data[key]){
            
            errors.push('El campo '+key+' no debe estar vacío.');

        }

    }

    if(errors.length > 0){

        return res.status(200).send({error:errors});

    }

    const checkUsuario = await usuario.findOne({usuario: data.usuario, email: data.email});

    if(checkUsuario === null){

        errors.push('El nombre de usuario y correo indicados no coinciden');

    }else{

        if(!checkUsuario.habilitado){

            errors.push('El usuario indicado no esta habilitado');
    
        }

    }

    if(errors.length > 0){

        return res.status(200).send({error:errors});

    }else{

        if(checkUsuario.comparePasswords(data.password)){

            return res.status(200).send({data:checkUsuario},200);
            
        }else{

            errors.push('La contraseña no es correcta.');

            return res.status(200).send({error:errors});

        }

    }

}

module.exports = {

    getUsuarios,
    crearUsuario,
    iniciarSesion,
    getRol,
    deshabilitar,
    perfil,
    modificaPerfil,
    paginationUsuariosAdmin,
    pedidosUsuario,
    paginationUsuariosEmpleado

};